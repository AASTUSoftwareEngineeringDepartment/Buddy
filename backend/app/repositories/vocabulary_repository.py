from typing import List, Optional
from app.db.mongo import MongoDB
from app.models.story.story import VocabularyWord
from datetime import datetime

class VocabularyRepository:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.vocabulary_collection = self.db["vocabulary_words"]
        self.stories_collection = self.db["stories"]

    async def create_vocabulary_words(self, vocabulary_words: List[VocabularyWord]) -> None:
        """Store vocabulary words in the database."""
        if vocabulary_words:
            await self.vocabulary_collection.insert_many([word.model_dump() for word in vocabulary_words])

    async def get_child_vocabulary_words(self, child_id: str) -> List[dict]:
        """Get all vocabulary words for a specific child with story titles."""
        # Get vocabulary words from vocabulary_words collection
        cursor = self.vocabulary_collection.find(
            {"child_id": child_id}
        ).sort("created_at", -1)
        
        vocabulary_words = await cursor.to_list(length=None)
        
        # Get story titles for each vocabulary word
        for word in vocabulary_words:
            story = await self.stories_collection.find_one(
                {"story_id": word["story_id"]},
                {"title": 1}
            )
            if story:
                word["story_title"] = story["title"]
            else:
                word["story_title"] = "Unknown Story"
            
            # Ensure all required fields are present
            word_dict = {
                "word": word["word"],
                "synonym": word["synonym"],
                "meaning": word.get("meaning", ""),  # Default to empty string if missing
                "related_words": word["related_words"],
                "story_title": word["story_title"],
                "created_at": word["created_at"]
            }
            word.clear()
            word.update(word_dict)
                
        return vocabulary_words

    async def get_vocabulary_words_by_story(self, story_id: str) -> List[VocabularyWord]:
        """Get all vocabulary words for a specific story."""
        cursor = self.vocabulary_collection.find({"story_id": story_id})
        words = await cursor.to_list(length=None)
        return [VocabularyWord(**word) for word in words]

    async def delete_vocabulary_words(self, story_id: str) -> bool:
        """Delete all vocabulary words for a specific story."""
        result = await self.vocabulary_collection.delete_many({"story_id": story_id})
        return result.deleted_count > 0

    async def update_vocabulary_word(self, word_id: str, word: VocabularyWord) -> Optional[VocabularyWord]:
        """Update a vocabulary word."""
        word_dict = word.model_dump()
        result = await self.vocabulary_collection.update_one(
            {"_id": word_id},
            {"$set": word_dict}
        )
        if result.modified_count > 0:
            return word
        return None

    async def get_vocabulary_word(self, word_id: str) -> Optional[VocabularyWord]:
        """Get a vocabulary word by its ID."""
        word = await self.vocabulary_collection.find_one({"_id": word_id})
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