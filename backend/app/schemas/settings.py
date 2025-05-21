from typing import List, Optional
from pydantic import BaseModel

class SettingsBase(BaseModel):
    preferences: List[str] = []
    themes: List[str] = []
    moral_values: List[str] = []
    favorite_animal: Optional[str] = None
    favorite_character: Optional[str] = None
    screen_time: int = 0

class SettingsCreate(SettingsBase):
    child_id: int

class SettingsUpdate(SettingsBase):
    pass

class SettingsInDB(SettingsBase):
    id: int
    child_id: int

    class Config:
        from_attributes = True 