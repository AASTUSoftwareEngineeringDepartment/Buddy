from fastapi import APIRouter, HTTPException
from app.models.science_qa import (
    QuestionGenerationRequest, 
    QuestionGenerationResponse, 
    ScienceQuestion,
    PDFProcessingRequest,
    PDFProcessingResponse
)
from app.services.vector_store import VectorStore
from app.services.pdf_processor import PDFProcessor
from app.services.llm.llm_service import LLMService
from typing import List
import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/science", tags=["science"])
vector_store = VectorStore()
pdf_processor = PDFProcessor()
llm_service = LLMService()

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
async def generate_question(request: QuestionGenerationRequest) -> QuestionGenerationResponse:
    try:
        # First try to get a chunk with the specified topic
        try:
            chunk = vector_store.get_random_chunk(request.topic)
            logger.info(f"Found chunk for topic: {request.topic}")
        except ValueError as e:
            # If no chunks found for topic, get any random chunk
            logger.warning(f"No chunks found for topic '{request.topic}', getting random chunk instead")
            chunk = vector_store.get_random_chunk()
        
        logger.info(f"Using chunk from book: {chunk['metadata']['book_title']}")
        
        # Get the system instruction and schema
        system_instruction = get_system_instruction(request.age_range, request.difficulty_level)
        response_schema = get_question_schema()
        
        # Create the prompt
        prompt = f"""{system_instruction}

Based on this science text, generate a multiple-choice question with 4 options:

Text content:
{chunk["content"]}

The question should be:
- Age-appropriate for {request.age_range} years old
- {request.difficulty_level} difficulty level
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
            difficulty_level=request.difficulty_level,
            age_range=request.age_range,
            topic=request.topic or "general"
        )
        
        logger.info(f"Successfully generated question for age range {request.age_range} and difficulty {request.difficulty_level}")
        
        return QuestionGenerationResponse(
            questions=[question],
            source_book=chunk["metadata"]["book_title"]
        )
        
    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate question: {str(e)}"
        ) 