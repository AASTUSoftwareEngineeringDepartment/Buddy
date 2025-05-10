from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config.settings import get_settings

settings = get_settings()

SECRET_KEY = getattr(settings, 'JWT_SECRET_KEY', None)
ALGORITHM = getattr(settings, 'JWT_ALGORITHM', 'HS256')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise JWTError("Invalid token") 