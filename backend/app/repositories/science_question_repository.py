from typing import List, Optional, Tuple
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
        question_dict["solved"] = False  # Initialize as not solved
        question_dict["attempts"] = 0  # Initialize attempts counter
        
        result = await self.collection.insert_one(question_dict)
        question_dict["_id"] = result.inserted_id
        
        return ScienceQuestion(**question_dict)

    async def answer_question(self, question_id: str, selected_index: int) -> Tuple[bool, ScienceQuestion]:
        """Answer a question and mark it as solved."""
        # Get the question
        question = await self.collection.find_one({"question_id": question_id})
        if not question:
            raise ValueError("Question not found")
            
        # Check if already solved correctly
        if question.get("solved", False) and question.get("scored", False):
            raise ValueError("Question already solved correctly")
            
        # Check if answer is correct
        is_correct = selected_index == question["correct_option_index"]
        
        # Update the question
        update_result = await self.collection.update_one(
            {"question_id": question_id},
            {
                "$set": {
                    "solved": True,
                    "selected_answer": selected_index,
                    "scored": is_correct,
                    "answered_at": datetime.utcnow()
                },
                "$inc": {
                    "attempts": 1  # Increment attempts counter
                }
            }
        )
        
        if update_result.modified_count == 0:
            raise ValueError("Failed to update question")
            
        # Get updated question
        updated_question = await self.collection.find_one({"question_id": question_id})
        return is_correct, ScienceQuestion(**updated_question)

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

    async def get_random_unsolved_question(self, child_id: str) -> Optional[ScienceQuestion]:
        """Get a random unsolved or incorrectly answered question for a child."""
        # Use aggregation to get a random question that is either unsolved or incorrectly answered
        pipeline = [
            {
                "$match": {
                    "child_id": child_id,
                    "$or": [
                        {"solved": False},
                        {"solved": True, "scored": False}
                    ]
                }
            },
            {"$sample": {"size": 1}}  # Get one random document
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        if result:
            return ScienceQuestion(**result[0])
        return None

    async def get_current_streak(self, child_id: str) -> int:
        """Get the current streak of correct answers for a child."""
        # Get the most recent questions for the child
        cursor = self.collection.find(
            {"child_id": child_id}
        ).sort("answered_at", -1)
        
        questions = await cursor.to_list(length=None)
        streak = 0
        
        for question in questions:
            if question.get("scored", False):
                streak += 1
            else:
                break
                
        return streak

    async def get_total_correct(self, child_id: str) -> int:
        """Get the total number of correct answers for a child."""
        count = await self.collection.count_documents({
            "child_id": child_id,
            "scored": True
        })
        return count 