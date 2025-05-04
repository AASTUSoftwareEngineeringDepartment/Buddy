from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.config.settings import get_settings
from app.models.enums import UserRole
from app.core.exceptions import UnauthorizedAccess

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

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

def require_role(required_role: UserRole):
    async def role_checker(user: tuple[str, UserRole] = Depends(get_current_user)):
        user_id, role = user
        if role != required_role:
            raise UnauthorizedAccess()
        return user_id
    return role_checker 