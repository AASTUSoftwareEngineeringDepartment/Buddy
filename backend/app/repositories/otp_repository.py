from datetime import datetime
from typing import Optional, Dict, Any
from app.db.mongo import MongoDB
from app.utils.otp import is_otp_expired

class OTPRepository:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.otp_collection = self.db["otp_codes"]
        self.registration_collection = self.db["registration_data"]

    async def store_registration_data(self, email: str, registration_data: Dict[str, Any]):
        """Store registration data temporarily."""
        await self.registration_collection.update_one(
            {"email": email},
            {"$set": {
                "data": registration_data,
                "created_at": datetime.utcnow()
            }},
            upsert=True
        )

    async def get_and_delete_registration_data(self, email: str) -> Optional[Dict[str, Any]]:
        """Get and delete registration data."""
        result = await self.registration_collection.find_one_and_delete({"email": email})
        return result["data"] if result else None

    async def create_otp(self, email: str, otp: str, expires_at: datetime):
        """Store OTP in the database."""
        await self.otp_collection.insert_one({
            "email": email,
            "otp": otp,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        })

    async def verify_otp(self, email: str, otp: str) -> bool:
        """Verify if OTP is valid and not expired."""
        print(f"Verifying OTP: {otp} for email: {email}")
        otp_doc = await self.otp_collection.find_one({
            "email": email,
            "otp": otp
        })
        
        if not otp_doc:
            print("OTP document not found")
            return False
            
        print(f"Found OTP document: {otp_doc}")
        
        if is_otp_expired(otp_doc["expires_at"]):
            print("OTP is expired")
            await self.otp_collection.delete_one({"_id": otp_doc["_id"]})
            return False
            
        # Only delete the OTP if it's valid and not expired
        print("OTP is valid and not expired")
        await self.otp_collection.delete_one({"_id": otp_doc["_id"]})
        return True

    async def delete_expired_otps(self):
        """Delete all expired OTPs."""
        await self.otp_collection.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        }) 