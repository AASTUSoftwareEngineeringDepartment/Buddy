from typing import List, Optional
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
        stories = await self.stories_collection.find({"child_id": child_id}).to_list(length=None)
        return [Story(**story) for story in stories]

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
                    "related_words": 1,
                    "created_at": 1,
                    "story_title": "$story.title"
                }
            },
            {"$sort": {"created_at": -1}}  # Sort by newest first
        ]
        
        vocabulary_words = await self.vocabulary_collection.aggregate(pipeline).to_list(length=None)
        return vocabulary_words 