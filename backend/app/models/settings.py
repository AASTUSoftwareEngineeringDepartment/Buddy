from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId

class SettingsBase(BaseModel):
    preferences: List[str] = Field(default_factory=list)
    themes: List[str] = Field(default_factory=list)
    moral_values: List[str] = Field(default_factory=list)
    favorite_animal: Optional[str] = Field(default=None)
    favorite_character: Optional[str] = Field(default=None)
    screen_time: int = Field(default=0)  # in minutes

    @field_validator('favorite_animal', 'favorite_character')
    @classmethod
    def validate_empty_strings(cls, v):
        if v == "":
            return None
        return v

class Settings(SettingsBase):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    child_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str
        }

class SettingsUpdate(BaseModel):
    preferences: Optional[List[str]] = None
    themes: Optional[List[str]] = None
    moral_values: Optional[List[str]] = None
    favorite_animal: Optional[str] = None
    favorite_character: Optional[str] = None
    screen_time: Optional[int] = None

    @field_validator('favorite_animal', 'favorite_character')
    @classmethod
    def validate_empty_strings(cls, v):
        if v == "":
            return None
        return v 