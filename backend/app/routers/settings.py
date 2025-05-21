from fastapi import APIRouter, HTTPException, Depends
from app.repositories.settings_repository import SettingsRepository
from app.models.settings import Settings
from app.api.v1.dependencies.auth import require_role
from app.models.enums import UserRole

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
    repo = SettingsRepository()
    settings = await repo.get_by_child_id(child_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/{child_id}", response_model=Settings)
async def update_settings(
    child_id: str,
    settings_update: Settings,
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    repo = SettingsRepository()
    updated_settings = await repo.update(child_id, settings_update.model_dump(exclude_unset=True))
    if not updated_settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return updated_settings 