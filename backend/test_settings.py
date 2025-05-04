# test_settings.py
from app.config.settings import get_settings

settings = get_settings()
print(f"MONGO_URI: {settings.MONGO_URI}")
print(f"MONGO_DB_NAME: {settings.MONGO_DB_NAME}")