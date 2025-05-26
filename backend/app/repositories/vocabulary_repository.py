from typing import List, Dict, Optional
from app.db.mongo import MongoDB
from app.models.story.story import VocabularyWord
from datetime import datetime
from bson import ObjectId

class VocabularyRepository:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.vocabulary_collection = self.db["vocabulary_words"]
        self.story_collection = self.db["stories"]

    async def create_vocabulary_words(self, vocabulary_words: List[VocabularyWord]) -> None:
        """Create multiple vocabulary words."""
        await self.vocabulary_collection.insert_many([word.model_dump() for word in vocabulary_words])

    async def get_child_vocabulary_words(self, child_id: str) -> List[Dict]:
        """Get all vocabulary words for a specific child with story titles."""
        pipeline = [
            {"$match": {"child_id": child_id}},
            {
                "$lookup": {
                    "from": "stories",
                    "localField": "story_id",
                    "foreignField": "story_id",
                    "as": "story"
                }
            },
            {"$unwind": "$story"},
            {
                "$project": {
                    "word": 1,
                    "synonym": 1,
                    "meaning": 1,
                    "related_words": 1,
                    "story_id": 1,
                    "child_id": 1,
                    "created_at": 1,
                    "story_title": "$story.title"
                }
            }
        ]
        cursor = self.vocabulary_collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    async def get_vocabulary_words_by_story(self, story_id: str) -> List[Dict]:
        """Get all vocabulary words for a specific story with story title."""
        pipeline = [
            {"$match": {"story_id": story_id}},
            {
                "$lookup": {
                    "from": "stories",
                    "localField": "story_id",
                    "foreignField": "story_id",
                    "as": "story"
                }
            },
            {"$unwind": "$story"},
            {
                "$project": {
                    "word": 1,
                    "synonym": 1,
                    "meaning": 1,
                    "related_words": 1,
                    "story_id": 1,
                    "child_id": 1,
                    "created_at": 1,
                    "story_title": "$story.title"
                }
            }
        ]
        cursor = self.vocabulary_collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    async def delete_vocabulary_words(self, story_id: str) -> bool:
        """Delete all vocabulary words for a specific story."""
        result = await self.vocabulary_collection.delete_many({"story_id": story_id})
        return result.deleted_count > 0

    async def update_vocabulary_word(self, word_id: str, word: VocabularyWord) -> Optional[VocabularyWord]:
        """Update a vocabulary word."""
        word_dict = word.model_dump()
        result = await self.vocabulary_collection.update_one(
            {"_id": ObjectId(word_id)},
            {"$set": word_dict}
        )
        if result.modified_count > 0:
            return word
        return None

    async def get_vocabulary_word(self, word_id: str) -> Optional[VocabularyWord]:
        """Get a vocabulary word by its ID."""
        word = await self.vocabulary_collection.find_one({"_id": ObjectId(word_id)})
        return VocabularyWord(**word) if word else None

    async def get_recent_vocabulary_words(
        self,
        child_id: str,
        limit: int = 10
    ) -> List[VocabularyWord]:
        """Get the most recent vocabulary words for a child."""
        cursor = self.vocabulary_collection.find(
            {"child_id": child_id}
        ).sort("created_at", -1).limit(limit)
        
        words = await cursor.to_list(length=None)
        return [VocabularyWord(**word) for word in words] 