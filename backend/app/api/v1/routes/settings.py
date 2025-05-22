from fastapi import APIRouter, HTTPException, Depends
from app.repositories.settings_repository import SettingsRepository
from app.models.settings import Settings, SettingsUpdate
from app.api.v1.dependencies.auth import require_role, get_current_user
from app.models.enums import UserRole
from app.services.user_service import UserService

router = APIRouter(
    prefix="/settings",
    tags=["settings"]
)

@router.post("/{child_id}", response_model=Settings)
async def create_settings(
    child_id: str,
    settings: Settings,
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    # Verify parent-child relationship
    user_service = UserService()
    child = await user_service.get_child(child_id)
    if not child or child.parent_id != parent_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create settings for your own children"
        )

    repo = SettingsRepository()
    # Check if settings already exist for this child
    existing_settings = await repo.get_by_child_id(child_id)
    if existing_settings:
        raise HTTPException(status_code=400, detail="Settings already exist for this child")
    
    settings.child_id = child_id
    return await repo.create(settings)

@router.get("/{child_id}", response_model=Settings)
async def get_settings(
    child_id: str,
    current_user: tuple[str, UserRole] = Depends(get_current_user)
):
    user_id, user_role = current_user
    
    # If the user is a child, they can only view their own settings
    if user_role == UserRole.CHILD and user_id != child_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own settings"
        )
    
    # If the user is a parent, verify parent-child relationship
    if user_role == UserRole.PARENT:
        user_service = UserService()
        child = await user_service.get_child(child_id)
        if not child or child.parent_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view settings for your own children"
            )

    repo = SettingsRepository()
    settings = await repo.get_by_child_id(child_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/{child_id}", response_model=Settings)
async def update_settings(
    child_id: str,
    settings_update: SettingsUpdate,
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    # Verify parent-child relationship
    user_service = UserService()
    child = await user_service.get_child(child_id)
    if not child or child.parent_id != parent_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update settings for your own children"
        )

    repo = SettingsRepository()
    updated_settings = await repo.update(child_id, settings_update.model_dump(exclude_unset=True))
    if not updated_settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return updated_settings 