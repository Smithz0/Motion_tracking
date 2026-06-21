from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, UserPayload
from app.models.models import User, Patient
from app.schemas.schemas import UserResponse, UserCreate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current logged in user's profile from local database.
    """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not synced. Call /auth/sync first."
        )
    return db_user

@router.post("/sync", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def sync_user(
    user_data: UserCreate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync Supabase Auth user record into local PostgreSQL database.
    Creates Patient or Admin sub-profile records depending on user role.
    """
    if current_user.id != user_data.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot sync profiles for other users."
        )

    # Check if user already exists
    db_user = db.query(User).filter(User.id == user_data.id).first()
    if db_user:
        # Update existing user values if necessary
        db_user.role = user_data.role
        if db_user.patient_profile:
            full_name = f"{user_data.first_name or ''} {user_data.last_name or ''}".strip()
            if full_name:
                db_user.patient_profile.full_name = full_name
        db.commit()
        db.refresh(db_user)
        return db_user

    # Create new User
    new_user = User(
        id=user_data.id,
        email=user_data.email,
        role=user_data.role
    )
    db.add(new_user)
    db.flush() # get id validation

    # Create role-specific profile
    if user_data.role.lower() != "admin":
        full_name = f"{user_data.first_name or ''} {user_data.last_name or ''}".strip() or "New Patient"
        patient_profile = Patient(user_id=new_user.id, full_name=full_name)
        db.add(patient_profile)

    db.commit()
    db.refresh(new_user)
    return new_user
