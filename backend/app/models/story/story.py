from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from uuid import uuid4

class VocabularyWord(BaseModel):
    word: str
    synonym: str
    related_words: List[str] = Field(description="Three words that are contextually relevant to the story but NOT related to the main word")
    story_id: str
    child_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Story(BaseModel):
    story_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    content: str
    age_range: str
    themes: List[str]
    moral_values: List[str]
    image_url: Optional[str] = None
    child_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StoryRequest(BaseModel):
    child_name: str
    age: int
    preferences: List[str]
    themes: List[str]
    moral_values: List[str]
    favorite_animal: Optional[str] = None
    favorite_character: Optional[str] = None

class StoryResponse(BaseModel):
    title: str
    story_body: str
    image_url: Optional[str] = None

class VocabularyResponse(BaseModel):
    word: str
    synonym: str
    related_words: List[str]
    story_title: str
    created_at: datetime 