from datetime import datetime
from typing import Optional, List
from app.db.mongo import MongoDB
from app.models.user import Parent, Child, UserProfileResponse
from app.models.settings import Settings
from app.models.enums import UserRole
from app.core.security import get_password_hash, verify_password, create_token_for_user
from app.core.exceptions import UserAlreadyExists, InvalidCredentials, UserNotFound
from app.utils.username_generator import generate_child_username
from app.services.email_service import EmailService

class UserService:
    def __init__(self):
        self.db = MongoDB.get_db()
        self.parents_collection = self.db["parents"]
        self.children_collection = self.db["children"]
        self.settings_collection = self.db["settings"]
        self.email_service = EmailService()

    async def check_email_available(self, email: str):
        """Check if email is available for registration."""
        if await self.parents_collection.find_one({"email": email}):
            raise UserAlreadyExists()

    async def check_username_available(self, username: str):
        """Check if username is available for registration."""
        if await self.parents_collection.find_one({"username": username}):
            raise UserAlreadyExists("Username is already taken")

    async def create_parent(self, email: str, username: str, password: str, first_name: str, last_name: str) -> Parent:
        # Check if parent already exists
        if await self.parents_collection.find_one({"email": email}):
            raise UserAlreadyExists()

        # Check if username is available
        if await self.parents_collection.find_one({"username": username}):
            raise UserAlreadyExists("Username is already taken")

        # Create parent
        parent = Parent(
            email=email,
            username=username,
            password_hash=get_password_hash(password),
            first_name=first_name,
            last_name=last_name
        )
        
        await self.parents_collection.insert_one(parent.dict())
        return parent

    async def create_child(
        self,
        parent_id: str,
        first_name: str,
        last_name: str,
        password: str,
        birth_date: Optional[datetime] = None,
        nickname: Optional[str] = None
    ) -> Child:
        # Get parent to generate username
        parent = await self.parents_collection.find_one({"parent_id": parent_id})
        if not parent:
            raise UserNotFound()

        # Generate username using parent's username
        username = generate_child_username(
            child_first_name=first_name,
            child_last_name=last_name,
            parent_username=parent["username"]
        )

        # Create child
        child = Child(
            parent_id=parent_id,
            first_name=first_name,
            last_name=last_name,
            birth_date=birth_date,
            nickname=nickname,
            username=username,
            password_hash=get_password_hash(password)
        )

        # Save child to database
        await self.children_collection.insert_one(child.model_dump())

        # Create default settings for the child
        settings = Settings(
            child_id=child.child_id,
            preferences=[],
            themes=[],
            moral_values=[],
            favorite_animal=None,
            favorite_character=None,
            screen_time=0
        )
        await self.settings_collection.insert_one(settings.model_dump(by_alias=True))

        # Send email to parent with child's credentials
        try:
            await self.email_service.send_child_credentials_email(
                parent_email=parent["email"],
                child_first_name=first_name,
                child_last_name=last_name,
                username=username,
                password=password
            )
        except Exception as e:
            # Log the email error but don't fail the child creation
            print(f"Failed to send email: {str(e)}")
            # The child account was created successfully, so we'll still return it
            # The email error will be handled by the route handler

        return child

    async def authenticate_user(self, username: str, password: str) -> tuple[str, UserRole]:
        """Authenticate user using username and password."""
        # Try parent authentication first
        user = await self.parents_collection.find_one({"username": username})
        if user and verify_password(password, user["password_hash"]):
            return user["parent_id"], UserRole.PARENT
            
        # Try child authentication
        user = await self.children_collection.find_one({"username": username})
        if user and verify_password(password, user["password_hash"]):
            return user["child_id"], UserRole.CHILD
            
        raise InvalidCredentials()

    async def get_parent(self, parent_id: str) -> Optional[Parent]:
        parent = await self.parents_collection.find_one({"parent_id": parent_id})
        return Parent(**parent) if parent else None

    async def get_child(self, child_id: str) -> Optional[Child]:
        child = await self.children_collection.find_one({"child_id": child_id})
        return Child(**child) if child else None

    async def get_parent_children(self, parent_id: str) -> List[Child]:
        """Get all children associated with a parent."""
        children = await self.children_collection.find({"parent_id": parent_id}).to_list(length=None)
        return [Child(**child) for child in children]

    async def get_child_parent(self, child_id: str) -> Optional[Parent]:
        """Get the parent information for a child."""
        # First get the child to get the parent_id
        child = await self.children_collection.find_one({"child_id": child_id})
        if not child:
            return None
            
        # Then get the parent using the parent_id
        parent = await self.parents_collection.find_one({"parent_id": child["parent_id"]})
        return Parent(**parent) if parent else None

    async def get_user_profile(self, user_id: str, role: UserRole) -> UserProfileResponse:
        """Get the user profile based on their role."""
        if role == UserRole.PARENT:
            parent = await self.get_parent(user_id)
            if not parent:
                raise UserNotFound("Parent not found")
            return UserProfileResponse(
                user_id=parent.parent_id,
                username=parent.username,
                first_name=parent.first_name,
                last_name=parent.last_name,
                role=parent.role,
                email=parent.email,
                created_at=parent.created_at
            )
        else:  # UserRole.CHILD
            child = await self.get_child(user_id)
            if not child:
                raise UserNotFound("Child not found")
            return UserProfileResponse(
                user_id=child.child_id,
                username=child.username,
                first_name=child.first_name,
                last_name=child.last_name,
                role=child.role,
                birth_date=child.birth_date,
                nickname=child.nickname,
                created_at=child.created_at
            )

    async def update_profile(self, user_id: str, role: UserRole, update_data: dict) -> UserProfileResponse:
        """Update user profile based on their role."""
        if role == UserRole.PARENT:
            # Check if email is being updated and if it's already taken
            if "email" in update_data and update_data["email"]:
                existing_user = await self.parents_collection.find_one({"email": update_data["email"]})
                if existing_user and existing_user["parent_id"] != user_id:
                    raise UserAlreadyExists("Email is already taken")

            # Update parent profile
            update_fields = {}
            if "email" in update_data and update_data["email"]:
                update_fields["email"] = update_data["email"]
            if "first_name" in update_data and update_data["first_name"]:
                update_fields["first_name"] = update_data["first_name"]
            if "last_name" in update_data and update_data["last_name"]:
                update_fields["last_name"] = update_data["last_name"]
            if "password" in update_data and update_data["password"]:
                update_fields["password_hash"] = get_password_hash(update_data["password"])

            if not update_fields:
                raise ValueError("No valid fields to update")

            result = await self.parents_collection.update_one(
                {"parent_id": user_id},
                {"$set": update_fields}
            )

            if result.modified_count == 0:
                raise UserNotFound("Parent not found")

            # Get updated parent profile
            return await self.get_user_profile(user_id, role)
        else:
            # For children, only allow updating name fields
            update_fields = {}
            if "first_name" in update_data and update_data["first_name"]:
                update_fields["first_name"] = update_data["first_name"]
            if "last_name" in update_data and update_data["last_name"]:
                update_fields["last_name"] = update_data["last_name"]
            if "password" in update_data and update_data["password"]:
                update_fields["password_hash"] = get_password_hash(update_data["password"])

            if not update_fields:
                raise ValueError("No valid fields to update")

            result = await self.children_collection.update_one(
                {"child_id": user_id},
                {"$set": update_fields}
            )

            if result.modified_count == 0:
                raise UserNotFound("Child not found")

            # Get updated child profile
            return await self.get_user_profile(user_id, role)

    async def update_child_profile(self, parent_id: str, child_id: str, update_data: dict) -> UserProfileResponse:
        """Update child profile by parent."""
        # First verify that the child belongs to the parent
        child = await self.children_collection.find_one({
            "child_id": child_id,
            "parent_id": parent_id
        })
        
        if not child:
            raise UserNotFound("Child not found or not associated with this parent")

        # Update child profile - only allow updating first_name, last_name, and nickname
        update_fields = {}
        if "first_name" in update_data and update_data["first_name"]:
            update_fields["first_name"] = update_data["first_name"]
        if "last_name" in update_data and update_data["last_name"]:
            update_fields["last_name"] = update_data["last_name"]
        if "nickname" in update_data and update_data["nickname"]:
            update_fields["nickname"] = update_data["nickname"]

        if not update_fields:
            raise ValueError("No valid fields to update")

        try:
            # Create a new Child instance with updated data
            updated_child = Child(**{**child, **update_fields})
            
            # Convert to dict for MongoDB update
            update_dict = updated_child.model_dump(exclude_unset=True)
            
            result = await self.children_collection.update_one(
                {"child_id": child_id},
                {"$set": update_dict}
            )

            if result.modified_count == 0:
                raise UserNotFound("Failed to update child profile")

            # Get updated child profile
            return await self.get_user_profile(child_id, UserRole.CHILD)
        except Exception as e:
            print(f"Error updating child profile: {str(e)}")
            raise UserNotFound(f"Failed to update child profile: {str(e)}") 