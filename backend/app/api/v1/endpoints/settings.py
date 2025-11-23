"""Settings API endpoints for user preferences and report templates."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, UserSettings
from app.schemas import (
    UserSettingsResponse,
    UserSettingsUpdate,
    TemplateUpdateRequest,
    ResetTemplateRequest,
    ProfileUpdateRequest,
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


def get_or_create_settings(user_id: str, db: Session) -> UserSettings:
    """Get user settings, creating if they don't exist."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    if not settings:
        settings = UserSettings(
            user_id=user_id,
            hmr_template=UserSettings.default_hmr_template(),
            rmmr_template=UserSettings.default_rmmr_template(),
            preferences=UserSettings.default_preferences(),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's settings."""
    settings = get_or_create_settings(current_user.id, db)
    return settings


@router.put("", response_model=UserSettingsResponse)
def update_settings(
    settings_data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's settings."""
    settings = get_or_create_settings(current_user.id, db)

    update_data = settings_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings


@router.get("/templates/{template_type}")
def get_template(
    template_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific report template (hmr or rmmr)."""
    if template_type not in ["hmr", "rmmr"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid template type. Must be 'hmr' or 'rmmr'.",
        )

    settings = get_or_create_settings(current_user.id, db)

    if template_type == "hmr":
        return {"template_type": "hmr", "template": settings.hmr_template}
    return {"template_type": "rmmr", "template": settings.rmmr_template}


@router.put("/templates/{template_type}")
def update_template(
    template_type: str,
    request: TemplateUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a specific report template."""
    if template_type not in ["hmr", "rmmr"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid template type. Must be 'hmr' or 'rmmr'.",
        )

    if request.template_type != template_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template type in request body must match URL parameter.",
        )

    settings = get_or_create_settings(current_user.id, db)

    if template_type == "hmr":
        settings.hmr_template = request.template
    else:
        settings.rmmr_template = request.template

    db.commit()
    db.refresh(settings)

    return {"template_type": template_type, "template": request.template}


@router.post("/templates/reset")
def reset_templates(
    request: ResetTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reset templates to defaults."""
    settings = get_or_create_settings(current_user.id, db)

    if request.template_type in ["hmr", "all"]:
        settings.hmr_template = UserSettings.default_hmr_template()

    if request.template_type in ["rmmr", "all"]:
        settings.rmmr_template = UserSettings.default_rmmr_template()

    db.commit()
    db.refresh(settings)

    return {
        "message": f"Successfully reset {request.template_type} template(s) to defaults",
        "hmr_template": settings.hmr_template if request.template_type in ["hmr", "all"] else None,
        "rmmr_template": settings.rmmr_template if request.template_type in ["rmmr", "all"] else None,
    }


@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    """Get current user's profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    user = db.query(User).filter(User.id == current_user.id).first()

    # Also update signature line in settings if provided
    signature_line = None

    update_data = profile_data.model_dump(exclude_unset=True)
    if "signature_line" in update_data:
        signature_line = update_data.pop("signature_line")

    for field, value in update_data.items():
        setattr(user, field, value)

    # Update signature in settings
    if signature_line is not None:
        settings = get_or_create_settings(current_user.id, db)
        settings.signature_line = signature_line

    db.commit()
    db.refresh(user)

    return user


@router.get("/preferences")
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's preferences."""
    settings = get_or_create_settings(current_user.id, db)
    return {"preferences": settings.preferences or UserSettings.default_preferences()}


@router.put("/preferences")
def update_preferences(
    preferences: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's preferences."""
    settings = get_or_create_settings(current_user.id, db)

    # Merge with existing preferences
    current_prefs = settings.preferences or UserSettings.default_preferences()
    current_prefs.update(preferences)
    settings.preferences = current_prefs

    db.commit()
    db.refresh(settings)

    return {"preferences": settings.preferences}
