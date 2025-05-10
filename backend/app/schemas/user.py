from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    """Schema for updating user profile"""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None 