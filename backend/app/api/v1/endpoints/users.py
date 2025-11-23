from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from app.schemas import UserUpdate, UserResponse, OnboardingData
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    update_data = user_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/me/onboarding", response_model=UserResponse)
def complete_onboarding(
    onboarding_data: OnboardingData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete user onboarding process."""
    if current_user.onboarding_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onboarding already completed",
        )

    if not onboarding_data.compliance_acknowledged:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must acknowledge compliance information",
        )

    # Update user profile with onboarding data
    current_user.ahpra_number = onboarding_data.ahpra_number
    current_user.conducts_hmr = onboarding_data.conducts_hmr
    current_user.conducts_rmmr = onboarding_data.conducts_rmmr
    current_user.organisation_name = onboarding_data.organisation_name
    current_user.onboarding_completed = True

    db.commit()
    db.refresh(current_user)

    return current_user
