from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class Settings(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    child_id: str
    preferences: List[str] = []
    themes: List[str] = []
    moral_values: List[str] = []
    favorite_animal: Optional[str] = None
    favorite_character: Optional[str] = None
    screen_time: int = 0  # in minutes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str
        } 