from typing import List, Optional
from app.models.science_qa import Achievement, AchievementType, ACHIEVEMENTS
from app.db.mongo import MongoDB
from datetime import datetime

class AchievementRepository:
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
            self._collection = self.db["achievements"]
        return self._collection

    async def create_achievement(self, achievement: Achievement) -> Achievement:
        """Create a new achievement."""
        achievement_dict = achievement.model_dump()
        achievement_dict["earned_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(achievement_dict)
        achievement_dict["_id"] = result.inserted_id
        
        return Achievement(**achievement_dict)

    async def get_child_achievements(self, child_id: str) -> List[Achievement]:
        """Get all achievements for a child."""
        cursor = self.collection.find({"child_id": child_id})
        achievements = await cursor.to_list(length=None)
        return [Achievement(**achievement) for achievement in achievements]

    async def has_achievement(self, child_id: str, achievement_type: AchievementType) -> bool:
        """Check if a child has a specific achievement."""
        achievement = await self.collection.find_one({
            "child_id": child_id,
            "type": achievement_type
        })
        return achievement is not None

    async def check_and_award_achievements(
        self,
        child_id: str,
        current_streak: int,
        total_correct: int
    ) -> List[Achievement]:
        """Check and award achievements based on current stats."""
        new_achievements = []
        
        # Check streak-based achievements
        streak_achievements = [
            (AchievementType.PERFECT_STREAK_BEGINNER, 5),
            (AchievementType.SCIENCE_MASTER, 15),
            (AchievementType.PERFECT_STREAK_LEGEND, 50)
        ]
        
        for achievement_type, required_streak in streak_achievements:
            if (current_streak >= required_streak and 
                not await self.has_achievement(child_id, achievement_type)):
                achievement_data = ACHIEVEMENTS[achievement_type]
                achievement = Achievement(
                    child_id=child_id,
                    type=achievement_type,
                    title=achievement_data["title"],
                    description=achievement_data["description"],
                    streak_count=current_streak
                )
                new_achievement = await self.create_achievement(achievement)
                new_achievements.append(new_achievement)
        
        # Check total-based achievements
        total_achievements = [
            (AchievementType.SCIENCE_EXPLORER, 10),
            (AchievementType.SCIENCE_CHAMPION, 50),
            (AchievementType.SCIENCE_GRANDMASTER, 100)
        ]
        
        for achievement_type, required_total in total_achievements:
            if (total_correct >= required_total and 
                not await self.has_achievement(child_id, achievement_type)):
                achievement_data = ACHIEVEMENTS[achievement_type]
                achievement = Achievement(
                    child_id=child_id,
                    type=achievement_type,
                    title=achievement_data["title"],
                    description=achievement_data["description"],
                    total_correct=total_correct
                )
                new_achievement = await self.create_achievement(achievement)
                new_achievements.append(new_achievement)
        
        return new_achievements 