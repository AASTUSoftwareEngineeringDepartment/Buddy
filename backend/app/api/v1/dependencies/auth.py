from typing import Optional, List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.config.settings import get_settings
from app.models.enums import UserRole
from app.core.exceptions import UnauthorizedAccess

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> tuple[str, UserRole]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
        return user_id, UserRole(role)
    except JWTError:
        raise credentials_exception

def require_role(required_roles: Union[UserRole, List[UserRole]]):
    """
    Dependency function to check if the user has one of the required roles.
    
    Args:
        required_roles: A single role or list of roles that are allowed to access the endpoint
    """
    if isinstance(required_roles, UserRole):
        required_roles = [required_roles]
        
    async def role_checker(user: tuple[str, UserRole] = Depends(get_current_user)):
        user_id, role = user
        if role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return user_id
    return role_checker 