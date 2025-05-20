from typing import List, Optional
from app.models.science_qa import ScienceQuestion
from app.db.mongo import MongoDB
from datetime import datetime

class ScienceQuestionRepository:
    def __init__(self):
        self._db = None
        self._collection = None

    @property
    def db(self):
        if self._db is None:
            self._db = MongoDB.get_db()
        return self._db

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.db["science_questions"]
        return self._collection

    async def create_question(self, question: ScienceQuestion) -> ScienceQuestion:
        """Create a new science question."""
        question_dict = question.model_dump()
        question_dict["created_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(question_dict)
        question_dict["_id"] = result.inserted_id
        
        return ScienceQuestion(**question_dict)

    async def get_questions_by_child_id(self, child_id: str) -> List[ScienceQuestion]:
        """Get all questions for a specific child."""
        cursor = self.collection.find({"child_id": child_id})
        questions = await cursor.to_list(length=None)
        return [ScienceQuestion(**question) for question in questions]

    async def get_question_by_id(self, question_id: str) -> Optional[ScienceQuestion]:
        """Get a specific question by ID."""
        question = await self.collection.find_one({"question_id": question_id})
        return ScienceQuestion(**question) if question else None

    async def get_recent_questions(self, child_id: str, limit: int = 10) -> List[ScienceQuestion]:
        """Get the most recent questions for a child."""
        cursor = self.collection.find(
            {"child_id": child_id}
        ).sort("created_at", -1).limit(limit)
        
        questions = await cursor.to_list(length=None)
        return [ScienceQuestion(**question) for question in questions]

    async def get_questions_by_topic(self, child_id: str, topic: str) -> List[ScienceQuestion]:
        """Get questions for a child by topic."""
        cursor = self.collection.find({
            "child_id": child_id,
            "topic": topic
        })
        
        questions = await cursor.to_list(length=None)
        return [ScienceQuestion(**question) for question in questions]

    async def get_questions_by_parent_id(self, parent_id: str, limit: int = 10) -> List[ScienceQuestion]:
        """Get recent questions for all children of a parent."""
        # First get all children of the parent
        children_collection = self.db["children"]
        children = await children_collection.find({"parent_id": parent_id}).to_list(length=None)
        child_ids = [child["child_id"] for child in children]
        
        if not child_ids:
            return []
            
        # Then get questions for all children
        cursor = self.collection.find(
            {"child_id": {"$in": child_ids}}
        ).sort("created_at", -1).limit(limit)
        
        questions = await cursor.to_list(length=None)
        return [ScienceQuestion(**question) for question in questions]

    async def get_child_questions_by_parent(self, parent_id: str, child_id: str, limit: int = 10) -> List[ScienceQuestion]:
        """Get questions for a specific child, verifying parent relationship."""
        # First verify that the child belongs to the parent
        children_collection = self.db["children"]
        child = await children_collection.find_one({
            "child_id": child_id,
            "parent_id": parent_id
        })
        
        if not child:
            return []
            
        # Then get questions for the child
        cursor = self.collection.find(
            {"child_id": child_id}
        ).sort("created_at", -1).limit(limit)
        
        questions = await cursor.to_list(length=None)
        return [ScienceQuestion(**question) for question in questions] 