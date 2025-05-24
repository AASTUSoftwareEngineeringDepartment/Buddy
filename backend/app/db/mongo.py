from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import get_settings
from bson import ObjectId

settings = get_settings()


def get_database():
    """Get the database instance."""
    return MongoDB.get_db()


class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_to_db(cls):
        cls.client = AsyncIOMotorClient(settings.MONGO_URI)
        cls.db = cls.client[settings.MONGO_DB_NAME]

    @classmethod
    async def close_db_connection(cls):
        if cls.client:
            cls.client.close()

    @classmethod
    def get_db(cls):
        return cls.db

    # --- CRUD methods for testing ---
    @classmethod
    async def create_user(cls, user_data: dict):
        result = await cls.db["users"].insert_one(user_data)
        user = await cls.db["users"].find_one({"_id": result.inserted_id})
        user["_id"] = str(user["_id"])
        return user

    @classmethod
    async def find_user(cls, query: dict):
        user = await cls.db["users"].find_one(query)
        if user and "_id" in user:
            user["_id"] = str(user["_id"])
        return user

    @classmethod
    async def update_user(cls, user_id, update_data: dict):
        await cls.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        user = await cls.db["users"].find_one({"_id": ObjectId(user_id)})
        if user and "_id" in user:
            user["_id"] = str(user["_id"])
        return user

    @classmethod
    async def create_story(cls, story_data: dict):
        result = await cls.db["stories"].insert_one(story_data)
        story = await cls.db["stories"].find_one({"_id": result.inserted_id})
        story["_id"] = str(story["_id"])
        return story

    @classmethod
    async def get_user_stories(cls, user_id):
        cursor = cls.db["stories"].find({"user_id": user_id})
        stories = []
        async for story in cursor:
            story["_id"] = str(story["_id"])
            stories.append(story)
        return stories

    @classmethod
    async def delete_story(cls, story_id):
        result = await cls.db["stories"].delete_one({"_id": ObjectId(story_id)})
        return result.deleted_count > 0 