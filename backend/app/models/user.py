from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_serializer
from uuid import uuid4

from app.models.enums import UserRole, ChildStatus

class Parent(BaseModel):
    parent_id: str = Field(default_factory=lambda: str(uuid4()))
    email: str
    username: str
    password_hash: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.PARENT
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Child(BaseModel):
    child_id: str = Field(default_factory=lambda: str(uuid4()))
    parent_id: str
    first_name: str
    last_name: str
    birth_date: Optional[datetime] = None
    nickname: Optional[str] = None
    username: str
    password_hash: str
    status: ChildStatus = ChildStatus.ACTIVE
    role: UserRole = UserRole.CHILD
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('birth_date')
    def serialize_birth_date(self, birth_date: Optional[datetime], _info):
        if birth_date:
            return birth_date.isoformat()
        return None

    @field_serializer('created_at')
    def serialize_created_at(self, created_at: datetime, _info):
        return created_at.isoformat() 