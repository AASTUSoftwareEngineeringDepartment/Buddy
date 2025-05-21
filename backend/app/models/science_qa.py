from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_serializer
from uuid import uuid4
from enum import Enum

class AchievementType(str, Enum):
    # Streak-based achievements
    PERFECT_STREAK_BEGINNER = "perfect_streak_beginner"  # 5 consecutive correct
    SCIENCE_MASTER = "science_master"  # 15 consecutive correct
    PERFECT_STREAK_LEGEND = "perfect_streak_legend"  # 50 consecutive correct
    UNSTOPPABLE_GENIUS = "unstoppable_genius"  # 100 consecutive correct
    
    # Total correct achievements
    SCIENCE_EXPLORER = "science_explorer"  # 10 total correct
    SCIENCE_CHAMPION = "science_champion"  # 50 total correct
    SCIENCE_GRANDMASTER = "science_grandmaster"  # 100 total correct
    KNOWLEDGE_TITAN = "knowledge_titan"  # 500 total correct
    
    # Topic-based achievements
    BIOLOGY_EXPERT = "biology_expert"  # 20 correct in biology
    CHEMISTRY_EXPERT = "chemistry_expert"  # 20 correct in chemistry
    PHYSICS_EXPERT = "physics_expert"  # 20 correct in physics
    ASTRONOMY_EXPERT = "astronomy_expert"  # 20 correct in astronomy
    
    # Speed-based achievements
    QUICK_LEARNER = "quick_learner"  # Answer correctly within 30 seconds
    SPEED_MASTER = "speed_master"  # Answer correctly within 15 seconds
    LIGHTNING_BRAIN = "lightning_brain"  # Answer correctly within 5 seconds
    
    # Difficulty-based achievements
    EASY_MASTER = "easy_master"  # Complete 50 easy questions
    MEDIUM_MASTER = "medium_master"  # Complete 50 medium questions
    HARD_MASTER = "hard_master"  # Complete 50 hard questions

class Achievement(BaseModel):
    achievement_id: str = Field(default_factory=lambda: str(uuid4()))
    child_id: str
    type: AchievementType
    title: str
    description: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    streak_count: Optional[int] = None  # For streak-based achievements
    total_correct: Optional[int] = None  # For total-based achievements

    @field_serializer('earned_at')
    def serialize_earned_at(self, earned_at: datetime, _info):
        return earned_at.isoformat()

# Achievement definitions
ACHIEVEMENTS = {
    # Streak-based achievements
    AchievementType.PERFECT_STREAK_BEGINNER: {
        "title": "Perfect Streak Beginner",
        "description": "Answered 5 questions correctly in a row!",
        "streak_required": 2
    },
    AchievementType.SCIENCE_MASTER: {
        "title": "Science Master",
        "description": "Answered 15 questions correctly in a row!",
        "streak_required": 15
    },
    AchievementType.PERFECT_STREAK_LEGEND: {
        "title": "Perfect Streak Legend",
        "description": "Answered 50 questions correctly in a row!",
        "streak_required": 50
    },
    AchievementType.UNSTOPPABLE_GENIUS: {
        "title": "Unstoppable Genius",
        "description": "Answered 100 questions correctly in a row!",
        "streak_required": 100
    },
    
    # Total correct achievements
    AchievementType.SCIENCE_EXPLORER: {
        "title": "Science Explorer",
        "description": "Answered 10 questions correctly!",
        "total_required": 10
    },
    AchievementType.SCIENCE_CHAMPION: {
        "title": "Science Champion",
        "description": "Answered 50 questions correctly!",
        "total_required": 50
    },
    AchievementType.SCIENCE_GRANDMASTER: {
        "title": "Science Grandmaster",
        "description": "Answered 100 questions correctly!",
        "total_required": 100
    },
    AchievementType.KNOWLEDGE_TITAN: {
        "title": "Knowledge Titan",
        "description": "Answered 500 questions correctly!",
        "total_required": 500
    },
    
    # Topic-based achievements
    AchievementType.BIOLOGY_EXPERT: {
        "title": "Biology Expert",
        "description": "Mastered 20 biology questions!",
        "topic_required": "biology",
        "topic_count_required": 20
    },
    AchievementType.CHEMISTRY_EXPERT: {
        "title": "Chemistry Expert",
        "description": "Mastered 20 chemistry questions!",
        "topic_required": "chemistry",
        "topic_count_required": 20
    },
    AchievementType.PHYSICS_EXPERT: {
        "title": "Physics Expert",
        "description": "Mastered 20 physics questions!",
        "topic_required": "physics",
        "topic_count_required": 20
    },
    AchievementType.ASTRONOMY_EXPERT: {
        "title": "Astronomy Expert",
        "description": "Mastered 20 astronomy questions!",
        "topic_required": "astronomy",
        "topic_count_required": 20
    },
    
    # Speed-based achievements
    AchievementType.QUICK_LEARNER: {
        "title": "Quick Learner",
        "description": "Answered correctly within 30 seconds!",
        "time_required": 30
    },
    AchievementType.SPEED_MASTER: {
        "title": "Speed Master",
        "description": "Answered correctly within 15 seconds!",
        "time_required": 15
    },
    AchievementType.LIGHTNING_BRAIN: {
        "title": "Lightning Brain",
        "description": "Answered correctly within 5 seconds!",
        "time_required": 5
    },
    
    # Difficulty-based achievements
    AchievementType.EASY_MASTER: {
        "title": "Easy Master",
        "description": "Completed 50 easy questions!",
        "difficulty_required": "easy",
        "difficulty_count_required": 50
    },
    AchievementType.MEDIUM_MASTER: {
        "title": "Medium Master",
        "description": "Completed 50 medium questions!",
        "difficulty_required": "medium",
        "difficulty_count_required": 50
    },
    AchievementType.HARD_MASTER: {
        "title": "Hard Master",
        "description": "Completed 50 hard questions!",
        "difficulty_required": "hard",
        "difficulty_count_required": 50
    }
}

class TextChunk(BaseModel):
    chunk_id: str = Field(default_factory=lambda: str(uuid4()))
    book_title: str
    content: str
    page_number: int
    chunk_index: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('created_at')
    def serialize_created_at(self, created_at: datetime, _info):
        return created_at.isoformat()

class ScienceQuestion(BaseModel):
    question_id: str = Field(default_factory=lambda: str(uuid4()))
    chunk_id: str
    question: str
    options: List[str]  # List of multiple choice options
    correct_option_index: int  # Index of the correct answer in options list
    difficulty_level: str  # "easy", "medium", "hard"
    age_range: str  # "4-6", "6-8"
    topic: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    child_id: Optional[str] = None  # ID of the child who received this question
    solved: bool = False  # Whether the question has been answered
    selected_answer: Optional[int] = None  # The answer selected by the child
    scored: Optional[bool] = None  # Whether the selected answer was correct
    answered_at: Optional[datetime] = None  # When the question was answered
    attempts: int = 0  # Number of attempts made to answer the question

    @field_serializer('created_at')
    def serialize_created_at(self, created_at: datetime, _info):
        return created_at.isoformat()

    @field_serializer('answered_at')
    def serialize_answered_at(self, answered_at: Optional[datetime], _info):
        return answered_at.isoformat() if answered_at else None

class QuestionGenerationRequest(BaseModel):
    topic: Optional[str] = None
    child_id: str  # Required field to get child's age and level

    def get_difficulty_level(self, child_level: int) -> str:
        """
        Determine difficulty level based on child's current level:
        Level 0-3: Easy
        Level 4-7: Medium
        Level 8-10: Hard
        """
        if child_level <= 3:
            return "easy"
        elif child_level <= 7:
            return "medium"
        else:
            return "hard"

    def get_age_range(self, birth_date: datetime) -> str:
        """
        Calculate age range based on birth date:
        4-6 years: "4-6"
        7-9 years: "7-9"
        10+ years: "10-12"
        """
        today = datetime.utcnow()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        if age <= 6:
            return "4-6"
        elif age <= 9:
            return "7-9"
        else:
            return "10-12"

class QuestionGenerationResponse(BaseModel):
    questions: List[ScienceQuestion]
    source_book: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('generated_at')
    def serialize_generated_at(self, generated_at: datetime, _info):
        return generated_at.isoformat()

class PDFProcessingRequest(BaseModel):
    book_title: str
    pdf_path: str

class PDFProcessingResponse(BaseModel):
    book_title: str
    num_chunks: int
    processed_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('processed_at')
    def serialize_processed_at(self, processed_at: datetime, _info):
        return processed_at.isoformat()

class AnswerQuestionRequest(BaseModel):
    question_id: str
    selected_index: int

class AnswerQuestionResponse(BaseModel):
    is_correct: bool
    question: ScienceQuestion
    new_achievements: List[Achievement] = []

class AchievementTableResponse(BaseModel):
    achievements: List[Achievement]
    total_achievements: int
    total_possible: int
    completion_percentage: float
    categories: Dict[str, List[Achievement]] = {
        "streak": [],
        "total": [],
        "topic": [],
        "speed": [],
        "difficulty": []
    }

class StreakResponse(BaseModel):
    current_streak: int
    total_correct: int
    next_streak_achievement: Optional[Achievement] = None
    streak_achievements: List[Achievement] = []
    streak_progress: float  # Percentage progress to next achievement

class Reward(BaseModel):
    reward_id: str = Field(default_factory=lambda: str(uuid4()))
    child_id: str
    level: int = Field(default=0, ge=0, le=10)  # Level from 0 to 10
    xp: int = Field(default=0, ge=0)  # Total XP points
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('created_at')
    def serialize_created_at(self, created_at: datetime, _info):
        return created_at.isoformat()

    @field_serializer('updated_at')
    def serialize_updated_at(self, updated_at: datetime, _info):
        return updated_at.isoformat()

    def add_xp(self, amount: int) -> bool:
        """
        Add XP points and handle level up if necessary.
        Returns True if level up occurred, False otherwise.
        """
        self.xp += amount
        self.updated_at = datetime.utcnow()
        
        # Check for level up (every 10 XP points)
        if self.xp >= 10 and self.level < 10:
            self.level += 1
            self.xp -= 10  # Reset XP after level up
            return True
        return False 