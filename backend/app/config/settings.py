from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    # MongoDB settings
    MONGO_URI: str
    MONGO_DB_NAME: str = "buddy_db"
    
    # JWT settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 36000
    
    # Security settings
    PASSWORD_HASH_ALGORITHM: str = "bcrypt"
    
    # Email settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str
    
    # Gemini settings
    GEMINI_API_KEY: str
    
    # Image Generator settings
    IMAGE_GENERATOR_URI: str = "https://a84e-34-125-77-122.ngrok-free.app/images/generate"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 