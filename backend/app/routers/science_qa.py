from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from app.models.science_qa import (
    QuestionGenerationRequest, 
    QuestionGenerationResponse, 
    ScienceQuestion,
    PDFProcessingRequest,
    PDFProcessingResponse,
    AnswerQuestionRequest,
    AnswerQuestionResponse,
    AchievementTableResponse,
    AchievementType,
    StreakResponse,
    Achievement,
    ACHIEVEMENTS,
    Reward
)
from app.models.user import Child
from app.services.vector_store import VectorStore
from app.services.pdf_processor import PDFProcessor
from app.services.llm.llm_service import LLMService
from app.repositories.science_question_repository import ScienceQuestionRepository
from app.repositories.achievement_repository import AchievementRepository
from app.repositories.reward_repository import RewardRepository
from app.api.v1.dependencies.auth import get_current_user, require_role
from app.models.enums import UserRole
from app.db.mongo import MongoDB
from typing import List, Optional
import os
import json
import logging
from dotenv import load_dotenv
import random
from fastapi import status

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/science", tags=["science"])
vector_store = VectorStore()
pdf_processor = PDFProcessor()
llm_service = LLMService()
question_repository = ScienceQuestionRepository()
achievement_repo = AchievementRepository()
reward_repo = RewardRepository()

async def get_child_info(child_id: str) -> Optional[Child]:
    """Get child information from the database."""
    db = MongoDB.get_db()
    child_data = await db["children"].find_one({"child_id": child_id})
    return Child(**child_data) if child_data else None

def get_question_repository() -> ScienceQuestionRepository:
    """Dependency to get an instance of ScienceQuestionRepository."""
    return ScienceQuestionRepository()

def get_achievement_repository() -> AchievementRepository:
    """Dependency to get an instance of AchievementRepository."""
    return AchievementRepository()

def get_reward_repository() -> RewardRepository:
    """Dependency to get an instance of RewardRepository."""
    return RewardRepository()

def get_question_schema():
    return {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The science question for children"
            },
            "options": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "List of 4 multiple choice options",
                "minItems": 4,
                "maxItems": 4,
                "uniqueItems": True
            },
            "correct_option_index": {
                "type": "integer",
                "description": "Index of the correct answer (0-3)",
                "minimum": 0,
                "maximum": 3
            }
        },
        "required": ["question", "options", "correct_option_index"],
        "additionalProperties": False
    }

def get_system_instruction(age_range: str, difficulty_level: str) -> str:
    return f"""You are a science question generator for children aged {age_range} years old.
Your task is to create engaging and educational multiple-choice science questions that are {difficulty_level} difficulty level.

Follow these rules:
1. Keep questions simple and clear
2. Use age-appropriate vocabulary
3. Include a fun analogy or comparison
4. Make it engaging and interactive
5. Create 4 multiple-choice options:
   - One correct answer
   - Three plausible but incorrect answers
   - All options should be similar in length
   - Avoid obviously wrong answers
6. Format the response as JSON with 'question', 'options', and 'correct_option_index' fields
7. Keep the answer concise but informative
8. Use examples that children can relate to
9. Avoid complex scientific jargon
10. Make it fun and interesting

Example response format:
{{
    "question": "What do plants need to grow big and strong?",
    "options": [
        "Sunlight and water",
        "Lots of toys",
        "New clothes",
        "A cozy bed"
    ],
    "correct_option_index": 0
}}"""

@router.post("/process-pdf", response_model=PDFProcessingResponse)
async def process_pdf(request: PDFProcessingRequest) -> PDFProcessingResponse:
    """Process a PDF file and store its chunks in the vector database."""
    try:
        # Check if PDF file exists
        if not os.path.exists(request.pdf_path):
            raise HTTPException(
                status_code=404,
                detail=f"PDF file not found: {request.pdf_path}"
            )

        # Process PDF and get chunks
        chunks = pdf_processor.process_pdf(request.pdf_path, request.book_title)
        
        # Store chunks in vector database
        vector_store.add_chunks(chunks)
        
        return PDFProcessingResponse(
            book_title=request.book_title,
            num_chunks=len(chunks)
        )
        
    except Exception as e:
        logger.error(f"Failed to process PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process PDF: {str(e)}"
        )

@router.post("/generate-question", response_model=QuestionGenerationResponse)
async def generate_question(
    request: QuestionGenerationRequest,
    child_id: str = Depends(require_role(UserRole.CHILD))
) -> QuestionGenerationResponse:
    try:
        # Get child's information
        child = await get_child_info(child_id)
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
            
        # Get child's current level
        reward_repo = RewardRepository()
        reward = await reward_repo.get_reward(child_id)
        if not reward:
            reward = Reward(child_id=child_id)
            reward = await reward_repo.create_reward(reward)
            
        # 70% chance to generate new question, 30% chance to get existing unsolved question
        if random.random() < 0.3:  # 30% chance
            # Try to get an existing unsolved or incorrect question
            existing_question = await question_repository.get_random_unsolved_question(child_id)
            if existing_question:
                logger.info(f"Returning existing unsolved question for child {child_id}")
                return QuestionGenerationResponse(
                    questions=[existing_question],
                    source_book="Previously generated question"
                )
        
        # If no existing question found or 70% chance hit, generate new question
        try:
            chunk = vector_store.get_random_chunk(request.topic)
            logger.info(f"Found chunk for topic: {request.topic}")
        except ValueError as e:
            # If no chunks found for topic, get any random chunk
            logger.warning(f"No chunks found for topic '{request.topic}', getting random chunk instead")
            chunk = vector_store.get_random_chunk()
        
        logger.info(f"Using chunk from book: {chunk['metadata']['book_title']}")
        
        # Get age range and difficulty level based on child's information
        age_range = request.get_age_range(child.birth_date)
        difficulty_level = request.get_difficulty_level(reward.level)
        
        # Get the system instruction and schema
        system_instruction = get_system_instruction(age_range, difficulty_level)
        response_schema = get_question_schema()
        
        # Create the prompt
        prompt = f"""{system_instruction}

Based on this science text, generate a multiple-choice question with 4 options:

Text content:
{chunk["content"]}

The question should be:
- Age-appropriate for {age_range} years old
- {difficulty_level} difficulty level
- Related to the topic: {request.topic or 'general science'}
- Fun and engaging
- Educational and clear
- Have 4 multiple-choice options
- One correct answer and three plausible but incorrect answers
"""
        
        # Generate question using LLM service
        qa_data = await llm_service.generate_json_content(
            prompt=prompt,
            json_schema=response_schema
        )
        
        # Create ScienceQuestion object
        question = ScienceQuestion(
            chunk_id=chunk["chunk_id"],
            question=qa_data["question"],
            options=qa_data["options"],
            correct_option_index=qa_data["correct_option_index"],
            difficulty_level=difficulty_level,
            age_range=age_range,
            topic=request.topic or "general",
            child_id=child_id
        )
        
        # Store the question in the database
        stored_question = await question_repository.create_question(question)
        
        logger.info(f"Successfully generated and stored new question for child {child_id}")
        
        return QuestionGenerationResponse(
            questions=[stored_question],
            source_book=chunk["metadata"]["book_title"]
        )
        
    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate question: {str(e)}"
        )

@router.get("/questions", response_model=List[ScienceQuestion])
async def get_child_questions(
    child_id: str = Depends(require_role(UserRole.CHILD)),
    topic: Optional[str] = None,
    limit: int = 10
) -> List[ScienceQuestion]:
    """Get questions for the current child."""
    try:
        if topic:
            questions = await question_repository.get_questions_by_topic(
                child_id,
                topic
            )
        else:
            questions = await question_repository.get_recent_questions(
                child_id,
                limit
            )
        return questions
    except Exception as e:
        logger.error(f"Error retrieving questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve questions: {str(e)}"
        )

@router.get("/parent/questions", response_model=List[ScienceQuestion])
async def get_parent_questions(
    parent_id: str = Depends(require_role(UserRole.PARENT)),
    limit: int = 10
) -> List[ScienceQuestion]:
    """Get questions for all children of the current parent."""
    try:
        questions = await question_repository.get_questions_by_parent_id(
            parent_id,
            limit
        )
        return questions
    except Exception as e:
        logger.error(f"Error retrieving parent questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve questions: {str(e)}"
        )

@router.get("/parent/child/{child_id}/questions", response_model=List[ScienceQuestion])
async def get_child_questions_by_parent(
    child_id: str,
    parent_id: str = Depends(require_role(UserRole.PARENT)),
    limit: int = 10
) -> List[ScienceQuestion]:
    """Get questions for a specific child, verifying parent relationship."""
    try:
        questions = await question_repository.get_child_questions_by_parent(
            parent_id,
            child_id,
            limit
        )
        return questions
    except Exception as e:
        logger.error(f"Error retrieving child questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve questions: {str(e)}"
        )

@router.post("/answer", response_model=AnswerQuestionResponse)
async def answer_question(
    request: AnswerQuestionRequest,
    child_id: str = Depends(require_role(UserRole.CHILD))
):
    """
    Answer a science question and get feedback.
    Only accessible by children.
    """
    try:
        repository = ScienceQuestionRepository()
        achievement_repo = AchievementRepository()
        reward_repo = RewardRepository()
        
        # Verify the question belongs to this child
        question = await repository.get_question_by_id(request.question_id)
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
            
        if question.child_id != child_id:
            raise HTTPException(status_code=403, detail="Not authorized to answer this question")
            
        # Process the answer
        is_correct, updated_question = await repository.answer_question(
            request.question_id,
            request.selected_index
        )
        
        # If answer is correct, add XP and check for achievements
        new_achievements = []
        if is_correct:
            # Add 1 XP for correct answer
            await reward_repo.add_xp_for_question(child_id)
            
            # Get current streak and total correct answers
            current_streak = await repository.get_current_streak(child_id)
            total_correct = await repository.get_total_correct(child_id)
            
            # Check and award achievements
            new_achievements = await achievement_repo.check_and_award_achievements(
                child_id=child_id,
                current_streak=current_streak,
                total_correct=total_correct
            )
            
            # Add 5 XP for each new achievement
            for achievement in new_achievements:
                await reward_repo.add_xp_for_achievement(child_id)
        
        return AnswerQuestionResponse(
            is_correct=is_correct,
            question=updated_question,
            new_achievements=new_achievements
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process answer")

@router.get("/achievements", response_model=AchievementTableResponse)
async def get_achievements(
    child_id: str = Depends(require_role(UserRole.CHILD)),
    achievement_repo: AchievementRepository = Depends(get_achievement_repository)
):
    """
    Get all achievements for a child in a table format, organized by category.
    """
    try:
        # Get all achievements for the child
        achievements = await achievement_repo.get_child_achievements(child_id)
        
        # Calculate total possible achievements
        total_possible = len(AchievementType)
        
        # Calculate completion percentage
        completion_percentage = (len(achievements) / total_possible) * 100
        
        # Organize achievements by category
        categories = {
            "streak": [],
            "total": [],
            "topic": [],
            "speed": [],
            "difficulty": []
        }
        
        for achievement in achievements:
            achievement_type = achievement.type
            if "streak" in achievement_type:
                categories["streak"].append(achievement)
            elif "total" in achievement_type:
                categories["total"].append(achievement)
            elif any(topic in achievement_type for topic in ["biology", "chemistry", "physics", "astronomy"]):
                categories["topic"].append(achievement)
            elif any(speed in achievement_type for speed in ["quick", "speed", "lightning"]):
                categories["speed"].append(achievement)
            elif any(difficulty in achievement_type for difficulty in ["easy", "medium", "hard"]):
                categories["difficulty"].append(achievement)
        
        return AchievementTableResponse(
            achievements=achievements,
            total_achievements=len(achievements),
            total_possible=total_possible,
            completion_percentage=completion_percentage,
            categories=categories
        )
        
    except Exception as e:
        logger.error(f"Error getting achievements for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve achievements"
        )

@router.get("/streak", response_model=StreakResponse)
async def get_streak_info(
    child_id: str = Depends(require_role(UserRole.CHILD)),
    question_repo: ScienceQuestionRepository = Depends(get_question_repository),
    achievement_repo: AchievementRepository = Depends(get_achievement_repository)
):
    """
    Get current streak information and streak-related achievements.
    """
    try:
        # Get current streak and total correct
        current_streak = await question_repo.get_current_streak(child_id)
        total_correct = await question_repo.get_total_correct(child_id)
        
        # Get all streak-based achievements
        streak_achievements = []
        next_achievement = None
        streak_progress = 0.0
        
        # Define streak milestones in order
        streak_milestones = [
            (AchievementType.PERFECT_STREAK_BEGINNER, 2),
            (AchievementType.SCIENCE_MASTER, 15),
            (AchievementType.PERFECT_STREAK_LEGEND, 50),
            (AchievementType.UNSTOPPABLE_GENIUS, 100)
        ]
        
        # Get all achievements for the child
        all_achievements = await achievement_repo.get_child_achievements(child_id)
        
        # Find streak achievements and next milestone
        for achievement in all_achievements:
            if "streak" in achievement.type:
                streak_achievements.append(achievement)
        
        # Find next streak achievement
        for achievement_type, required_streak in streak_milestones:
            if not any(a.type == achievement_type for a in streak_achievements):
                next_achievement = Achievement(
                    child_id=child_id,
                    type=achievement_type,
                    title=ACHIEVEMENTS[achievement_type]["title"],
                    description=ACHIEVEMENTS[achievement_type]["description"]
                )
                # Calculate progress to next achievement
                streak_progress = (current_streak / required_streak) * 100
                break
        
        return StreakResponse(
            current_streak=current_streak,
            total_correct=total_correct,
            next_streak_achievement=next_achievement,
            streak_achievements=streak_achievements,
            streak_progress=streak_progress
        )
        
    except Exception as e:
        logger.error(f"Error getting streak info for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve streak information"
        )

@router.get("/rewards", response_model=Reward)
async def get_child_rewards(
    child_id: str = Depends(require_role(UserRole.CHILD)),
    reward_repo: RewardRepository = Depends(get_reward_repository)
):
    """
    Get current level and XP for a child.
    """
    try:
        reward = await reward_repo.get_reward(child_id)
        if not reward:
            # Create initial reward record if none exists
            reward = Reward(child_id=child_id)
            reward = await reward_repo.create_reward(reward)
        return reward
    except Exception as e:
        logger.error(f"Error getting rewards for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve rewards"
        ) 