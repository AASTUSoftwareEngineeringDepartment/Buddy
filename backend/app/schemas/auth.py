from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, constr, field_serializer

class RegisterInitiateRequest(BaseModel):
    """Schema for initiating registration and sending OTP"""
    email: EmailStr
    username: str
    password: str
    first_name: str
    last_name: str

class VerifyOTPRequest(BaseModel):
    """Schema for verifying OTP and completing registration"""
    email: EmailStr
    otp: str

class LoginRequest(BaseModel):
    """Schema for user login"""
    username: str
    password: str

class ChildCreateRequest(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[date] = None
    nickname: Optional[str] = None
    password: str

    @field_serializer('birth_date')
    def serialize_birth_date(self, birth_date: Optional[date], _info):
        if birth_date:
            return birth_date.isoformat()
        return None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str

class MessageResponse(BaseModel):
    message: str 