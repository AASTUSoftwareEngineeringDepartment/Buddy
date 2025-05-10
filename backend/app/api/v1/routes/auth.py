from fastapi import APIRouter, Depends, HTTPException
from app.services.user_service import UserService
from app.services.otp_service import OTPService
from app.schemas.auth import (
    RegisterInitiateRequest, 
    VerifyOTPRequest, 
    LoginRequest, 
    TokenResponse,
    MessageResponse
)
from app.schemas.user import ProfileUpdateRequest
from app.models.user import UserProfileResponse
from app.core.security import create_token_for_user
from app.api.v1.dependencies.auth import get_current_user
from app.models.enums import UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=MessageResponse)
async def initiate_registration(request: RegisterInitiateRequest):
    """
    Step 1: Initiate registration by sending OTP
    - Validate email and username are not already registered
    - Store registration data temporarily
    - Send OTP to email
    """
    user_service = UserService()
    otp_service = OTPService()
    
    # Check if email and username are available
    await user_service.check_email_available(request.email)
    await user_service.check_username_available(request.username)
    
    # Store registration data and send OTP
    await otp_service.store_registration_data(
        email=request.email,
        username=request.username,
        password=request.password,
        first_name=request.first_name,
        last_name=request.last_name
    )
    
    # Send OTP
    return await otp_service.send_otp(request.email)

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_and_complete_registration(request: VerifyOTPRequest):
    """
    Step 2: Verify OTP and complete registration
    - Verify OTP
    - Create user account with stored registration data
    - Return JWT token
    """
    otp_service = OTPService()
    user_service = UserService()
    
    # Verify OTP and get registration data
    registration_data = await otp_service.verify_otp_and_get_registration_data(
        email=request.email,
        otp=request.otp
    )
    
    # Create parent account
    parent = await user_service.create_parent(
        email=registration_data["email"],
        username=registration_data["username"],
        password=registration_data["password"],
        first_name=registration_data["first_name"],
        last_name=registration_data["last_name"]
    )
    
    token = create_token_for_user(parent.parent_id, parent.role)
    return TokenResponse(
        access_token=token,
        role=parent.role,
        user_id=parent.parent_id
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user with username and password."""
    user_service = UserService()
    user_id, role = await user_service.authenticate_user(
        username=request.username,
        password=request.password
    )
    
    token = create_token_for_user(user_id, role)
    return TokenResponse(
        access_token=token,
        role=role,
        user_id=user_id
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: tuple[str, UserRole] = Depends(get_current_user)
):
    """
    Get the profile of the currently logged-in user.
    Works for both parent and child users.
    """
    try:
        user_id, role = current_user
        user_service = UserService()
        return await user_service.get_user_profile(user_id, role)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    update_data: ProfileUpdateRequest,
    current_user: tuple[str, UserRole] = Depends(get_current_user)
):
    """
    Update the profile of the currently logged-in user.
    - Parents can update their email, first name, last name, and password
    - Children can only update their first name, last name, and password
    """
    try:
        user_id, role = current_user
        user_service = UserService()
        return await user_service.update_profile(user_id, role, update_data.model_dump(exclude_unset=True))
    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        ) 