from fastapi import APIRouter, Depends, HTTPException
from app.services.user_service import UserService
from app.schemas.auth import ChildCreateRequest, TokenResponse
from app.schemas.user import ChildProfileUpdateRequest
from app.api.v1.dependencies.auth import require_role, get_current_user
from app.models.enums import UserRole
from app.core.security import create_token_for_user
from typing import List
from app.models.user import Child, Parent, UserProfileResponse

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

@router.get("/my-children", response_model=List[Child])
async def get_my_children(
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    """
    Get all children associated with the current parent.
    Only accessible by parents.
    """
    try:
        user_service = UserService()
        children = await user_service.get_parent_children(parent_id)
        return children
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve children: {str(e)}"
        )

@router.get("/my-parent", response_model=Parent)
async def get_my_parent(
    current_user: tuple[str, UserRole] = Depends(get_current_user)
):
    """
    Get the parent information for the current child.
    Only accessible by children.
    """
    try:
        user_id, user_role = current_user
        if user_role != UserRole.CHILD:
            raise HTTPException(
                status_code=403,
                detail="Only children can access their parent's information"
            )
        
        user_service = UserService()
        parent = await user_service.get_child_parent(user_id)
        if not parent:
            raise HTTPException(
                status_code=404,
                detail="Parent not found"
            )
        return parent
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve parent information: {str(e)}"
        )

@router.put("/{child_id}/profile", response_model=UserProfileResponse)
async def update_child_profile(
    child_id: str,
    update_data: ChildProfileUpdateRequest,
    parent_id: str = Depends(require_role(UserRole.PARENT))
):
    """
    Update a child's profile. Only accessible by the child's parent.
    """
    try:
        user_service = UserService()
        return await user_service.update_child_profile(
            parent_id=parent_id,
            child_id=child_id,
            update_data=update_data.model_dump(exclude_unset=True)
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update child profile: {str(e)}"
        ) 