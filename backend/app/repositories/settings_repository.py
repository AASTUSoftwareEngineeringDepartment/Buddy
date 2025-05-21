from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.db.mongo import MongoDB
from app.models.settings import Settings

class SettingsRepository:
    def __init__(self):
        self.collection = MongoDB.get_collection("settings")

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
        update_data = {
            **settings_update,
            "updated_at": datetime.utcnow()
        }
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