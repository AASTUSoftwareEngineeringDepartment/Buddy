from fastapi import APIRouter, Depends, HTTPException
from app.services.user_service import UserService
from app.schemas.auth import ChildCreateRequest, TokenResponse
from app.api.v1.dependencies.auth import require_role
from app.models.enums import UserRole
from app.core.security import create_token_for_user

router = APIRouter(prefix="/children", tags=["children"])

@router.post("", response_model=TokenResponse)
async def create_child(
    request: ChildCreateRequest,
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    try:
        user_service = UserService()
        child = await user_service.create_child(
            parent_id=parent_id,
            first_name=request.first_name,
            last_name=request.last_name,
            birth_date=request.birth_date,
            nickname=request.nickname,
            password=request.password
        )
        
        token = create_token_for_user(child.child_id, child.role)
        return TokenResponse(
            access_token=token,
            role=child.role,
            user_id=child.child_id
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Error creating child account: {str(e)}")
        # Return a more specific error message
        raise HTTPException(
            status_code=500,
            detail="Child account was created but there was an error sending the email notification. Please check the child's credentials in the database."
        ) 