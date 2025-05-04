import random
from datetime import datetime, timedelta
from typing import Optional

def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))

def is_otp_expired(expires_at: datetime) -> bool:
    """Check if OTP has expired."""
    current_time = datetime.utcnow()
    print(f"Current time (UTC): {current_time}")
    print(f"OTP expires at: {expires_at}")
    is_expired = current_time > expires_at
    print(f"Is OTP expired? {is_expired}")
    return is_expired

def get_otp_expiry(minutes: int = 5) -> datetime:
    """Get the expiry datetime for an OTP."""
    return datetime.utcnow() + timedelta(minutes=minutes) 