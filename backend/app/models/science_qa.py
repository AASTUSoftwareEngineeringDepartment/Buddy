from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_serializer
from uuid import uuid4

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
    answer: str
    difficulty_level: str  # "easy", "medium", "hard"
    age_range: str  # "4-6", "6-8"
    topic: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('created_at')
    def serialize_created_at(self, created_at: datetime, _info):
        return created_at.isoformat()

class QuestionGenerationRequest(BaseModel):
    topic: Optional[str] = None
    age_range: str = "4-8"
    difficulty_level: str = "easy"
    num_questions: int = 1

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