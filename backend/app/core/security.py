import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.config import settings

security = HTTPBearer()

class UserPayload(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    role: str = "patient"  # default role

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserPayload:
    """
    Decodes and verifies the Supabase Auth JWT.
    """
    token = credentials.credentials
    
    # 1. Support sandbox/demo mock tokens in development mode
    if token.startswith("mock-token."):
        if settings.ENVIRONMENT != "development":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mock authentication is only permitted in development mode."
            )
        import base64
        import json
        try:
            parts = token.split(".")
            # Base64 padding correction if needed
            payload_b64 = parts[1]
            payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
            payload_str = base64.b64decode(payload_b64).decode("utf-8")
            payload = json.loads(payload_str)
            
            user_id = payload.get("sub")
            email = payload.get("email")
            app_metadata = payload.get("app_metadata", {})
            role = app_metadata.get("role") or "patient"
            
            if not user_id:
                raise ValueError("Missing subject field (sub).")
                
            return UserPayload(id=user_id, email=email, role=role)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid mock token format: {str(e)}"
            )

    try:
        # 2. Check if we should bypass signature check during local dev setup
        bypass_signature = (
            settings.ENVIRONMENT == "development" 
            and (not settings.SUPABASE_JWT_SECRET or settings.SUPABASE_JWT_SECRET == "your-supabase-jwt-secret-from-dashboard")
        )
        
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_signature": not bypass_signature, "verify_aud": False}
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        app_metadata = payload.get("app_metadata", {})
        user_metadata = payload.get("user_metadata", {})
        
        role = app_metadata.get("role") or user_metadata.get("role") or "patient"
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: Missing subject (sub)."
            )
            
        return UserPayload(id=user_id, email=email, role=role)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

def get_current_user(payload: UserPayload = Depends(verify_supabase_jwt)) -> UserPayload:
    """
    Returns the authenticated user's payload.
    """
    return payload

def require_admin(user: UserPayload = Depends(get_current_user)) -> UserPayload:
    """
    Restricts access to Admin role users.
    """
    if user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin permissions required."
        )
    return user

def require_patient(user: UserPayload = Depends(get_current_user)) -> UserPayload:
    """
    Restricts access to Patient role users.
    """
    if user.role.lower() != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Patient permissions required."
        )
    return user
