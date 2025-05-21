from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_serializer
from uuid import uuid4

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