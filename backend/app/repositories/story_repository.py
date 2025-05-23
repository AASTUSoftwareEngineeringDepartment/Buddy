from typing import List, Optional, Tuple
from app.db.mongo import MongoDB
from app.models.story.story import Story, VocabularyWord

class StoryRepository:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.stories_collection = self.db["stories"]
        self.vocabulary_collection = self.db["vocabulary_words"]

    async def create_story(self, story: Story) -> Story:
        """Create a new story in the database."""
        story_dict = story.model_dump()
        await self.stories_collection.insert_one(story_dict)
        return story

    async def get_story(self, story_id: str) -> Optional[Story]:
        """Get a story by its ID."""
        story = await self.stories_collection.find_one({"story_id": story_id})
        return Story(**story) if story else None

    async def get_child_stories(self, child_id: str) -> List[Story]:
        """Get all stories for a specific child."""
        cursor = self.stories_collection.find({"child_id": child_id})
        stories = await cursor.to_list(length=None)
        return [Story(**story) for story in stories]

    async def get_child_stories_paginated(
        self,
        child_id: str,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[Story], int]:
        # Get total count
        total = await self.stories_collection.count_documents({"child_id": child_id})
        
        # Get paginated stories
        cursor = self.stories_collection.find(
            {"child_id": child_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        stories = await cursor.to_list(length=None)
        return [Story(**story) for story in stories], total

    async def update_story(self, story_id: str, story: Story) -> Optional[Story]:
        """Update a story in the database."""
        story_dict = story.model_dump()
        result = await self.stories_collection.update_one(
            {"story_id": story_id},
            {"$set": story_dict}
        )
        if result.modified_count > 0:
            return story
        return None

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

    async def delete_story(self, story_id: str, child_id: str) -> bool:
        """Delete a story from the database if it belongs to the specified child."""
        result = await self.stories_collection.delete_one({
            "story_id": story_id,
            "child_id": child_id
        })
        return result.deleted_count > 0 