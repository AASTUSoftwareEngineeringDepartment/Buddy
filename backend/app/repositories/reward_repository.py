from typing import Optional
from app.db.mongo import MongoDB
from app.models.reward import Reward
from datetime import datetime

class RewardRepository:
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
            self._collection = self.db["rewards"]
        return self._collection

    async def create_reward(self, reward: Reward) -> Reward:
        """Create a new reward record for a child."""
        reward_dict = reward.model_dump()
        await self.collection.insert_one(reward_dict)
        return reward

    async def get_reward(self, child_id: str) -> Optional[Reward]:
        """Get reward record for a child."""
        reward = await self.collection.find_one({"child_id": child_id})
        return Reward(**reward) if reward else None

    async def update_reward(self, reward: Reward) -> Optional[Reward]:
        """Update a reward record."""
        reward_dict = reward.model_dump()
        result = await self.collection.update_one(
            {"child_id": reward.child_id},
            {"$set": reward_dict}
        )
        if result.modified_count > 0:
            return reward
        return None

    async def add_xp_for_question(self, child_id: str) -> Optional[Reward]:
        """Add 1 XP for answering a question."""
        reward = await self.get_reward(child_id)
        if not reward:
            reward = Reward(child_id=child_id)
            return await self.create_reward(reward)
        
        reward.add_xp(1)
        return await self.update_reward(reward)

    async def add_xp_for_achievement(self, child_id: str) -> Optional[Reward]:
        """Add 5 XP for earning an achievement."""
        reward = await self.get_reward(child_id)
        if not reward:
            reward = Reward(child_id=child_id)
            return await self.create_reward(reward)
        
        reward.add_xp(5)
        return await self.update_reward(reward) 