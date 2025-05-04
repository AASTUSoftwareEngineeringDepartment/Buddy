from datetime import datetime
from typing import Dict, Any
from pydantic import EmailStr
from app.repositories.otp_repository import OTPRepository
from app.services.email_service import EmailService
from app.utils.otp import generate_otp, get_otp_expiry
from app.core.exceptions import OTPExpired, OTPInvalid

class OTPService:
    def __init__(self):
        self.otp_repo = OTPRepository()
        self.email_service = EmailService()

    async def store_registration_data(
        self,
        email: str,
        username: str,
        password: str,
        first_name: str,
        last_name: str
    ):
        """Store registration data temporarily."""
        await self.otp_repo.store_registration_data(
            email=email,
            registration_data={
                "email": email,
                "username": username,
                "password": password,
                "first_name": first_name,
                "last_name": last_name
            }
        )

    async def send_otp(self, email: EmailStr):
        """Generate and send OTP to the user's email."""
        otp = generate_otp()
        expires_at = get_otp_expiry()
        
        await self.otp_repo.create_otp(email, otp, expires_at)
        await self.email_service.send_otp_email(email, otp)
        
        return {"message": "OTP sent successfully"}

    async def verify_otp_and_get_registration_data(self, email: EmailStr, otp: str) -> Dict[str, Any]:
        """Verify the OTP and return the stored registration data."""
        is_valid = await self.otp_repo.verify_otp(email, otp)
        
        if not is_valid:
            raise OTPInvalid()
            
        # Get and delete registration data
        registration_data = await self.otp_repo.get_and_delete_registration_data(email)
        if not registration_data:
            raise OTPInvalid("Registration data not found")
            
        return registration_data 