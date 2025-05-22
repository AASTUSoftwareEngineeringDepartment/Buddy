from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.db.mongo import MongoDB
from app.models.settings import Settings, SettingsUpdate

class SettingsRepository:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.collection = self.db["settings"]

    async def create(self, settings: Settings) -> Settings:
        settings_dict = settings.model_dump(by_alias=True)
        await self.collection.insert_one(settings_dict)
        return settings

    async def get_by_child_id(self, child_id: str) -> Optional[Settings]:
        settings_dict = await self.collection.find_one({"child_id": child_id})
        if settings_dict:
            return Settings(**settings_dict)
        return None

    async def update(self, child_id: str, settings_update: dict) -> Optional[Settings]:
        # Get existing settings
        existing_settings = await self.get_by_child_id(child_id)
        if not existing_settings:
            return None

        # Create a SettingsUpdate instance with the update data
        update_model = SettingsUpdate(**settings_update)
        
        # Convert to dict and remove None values
        update_data = {k: v for k, v in update_model.model_dump().items() if v is not None}
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.utcnow()

        # Perform the update
        result = await self.collection.find_one_and_update(
            {"child_id": child_id},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            return Settings(**result)
        return None

    async def delete(self, child_id: str) -> bool:
        result = await self.collection.delete_one({"child_id": child_id})
        return result.deleted_count > 0 