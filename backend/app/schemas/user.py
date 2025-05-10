from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class ProfileUpdateRequest(BaseModel):
    """Schema for updating user profile"""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None

class ChildProfileUpdateRequest(BaseModel):
    """Schema for updating child profile by parent"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    nickname: Optional[str] = None
    password: Optional[str] = None 