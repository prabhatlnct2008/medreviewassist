from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models import Review, Consent, User, ReviewStatus
from app.schemas import ConsentUpdate, ConsentResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews/{review_id}/consent", tags=["Consent"])


def get_review_or_404(review_id: str, user_id: str, db: Session) -> Review:
    """Helper to get review and verify ownership."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == user_id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    return review


@router.get("", response_model=ConsentResponse)
def get_consent(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get consent status for a review."""
    get_review_or_404(review_id, current_user.id, db)

    consent = db.query(Consent).filter(
        Consent.review_id == review_id,
    ).first()

    if not consent:
        # Create if doesn't exist
        consent = Consent(review_id=review_id)
        db.add(consent)
        db.commit()
        db.refresh(consent)

    return consent


@router.put("", response_model=ConsentResponse)
def update_consent(
    review_id: str,
    consent_data: ConsentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update consent for a review."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    consent = db.query(Consent).filter(
        Consent.review_id == review_id,
    ).first()

    if not consent:
        consent = Consent(review_id=review_id)
        db.add(consent)

    consent.obtained = consent_data.obtained
    consent.notes = consent_data.notes

    if consent_data.obtained and not consent.obtained_at:
        consent.obtained_at = datetime.utcnow()

    db.commit()
    db.refresh(consent)

    return consent
