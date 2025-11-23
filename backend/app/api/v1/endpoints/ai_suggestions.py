from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.models import Review, Medication, ClinicalNote, AISuggestion, User, ReviewStatus, Patient
from app.models.enums import SuggestionSeverity, SuggestionCategory
from app.schemas import AISuggestionUpdate, AISuggestionResponse
from app.api.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/reviews/{review_id}/ai", tags=["AI Suggestions"])


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


@router.post("/generate", response_model=List[AISuggestionResponse])
def generate_ai_suggestions(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate AI suggestions for a review."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate suggestions for a submitted review",
        )

    # Get medications and clinical notes
    medications = db.query(Medication).filter(Medication.review_id == review_id).all()
    clinical_notes = db.query(ClinicalNote).filter(ClinicalNote.review_id == review_id).all()
    patient = db.query(Patient).filter(Patient.id == review.patient_id).first()

    # Calculate patient age
    patient_age = None
    if patient and patient.date_of_birth:
        today = date.today()
        patient_age = today.year - patient.date_of_birth.year
        if (today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day):
            patient_age -= 1

    patient_sex = patient.sex.value if patient else None

    # Clear existing suggestions
    db.query(AISuggestion).filter(AISuggestion.review_id == review_id).delete()

    # Generate new suggestions
    raw_suggestions = ai_service.generate_suggestions(
        medications=medications,
        clinical_notes=clinical_notes,
        patient_age=patient_age,
        patient_sex=patient_sex,
    )

    # Create suggestion records
    suggestions = []
    for raw in raw_suggestions:
        try:
            severity = SuggestionSeverity(raw.get("severity", "info"))
        except ValueError:
            severity = SuggestionSeverity.INFO

        try:
            category = SuggestionCategory(raw.get("category", "other"))
        except ValueError:
            category = SuggestionCategory.OTHER

        suggestion = AISuggestion(
            review_id=review_id,
            severity=severity,
            title=raw.get("title", "Untitled"),
            category=category,
            description=raw.get("description", ""),
            involved_medications=raw.get("involved_medications", []),
            clinical_rationale=raw.get("clinical_rationale", ""),
            evidence_summary=raw.get("evidence_summary", ""),
            suggested_text=raw.get("suggested_text", ""),
        )
        db.add(suggestion)
        suggestions.append(suggestion)

    db.commit()

    for s in suggestions:
        db.refresh(s)

    return suggestions


@router.get("/suggestions", response_model=List[AISuggestionResponse])
def get_ai_suggestions(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get existing AI suggestions for a review."""
    get_review_or_404(review_id, current_user.id, db)

    suggestions = (
        db.query(AISuggestion)
        .filter(AISuggestion.review_id == review_id)
        .order_by(AISuggestion.severity.desc(), AISuggestion.created_at)
        .all()
    )

    return suggestions


@router.put("/suggestions/{suggestion_id}", response_model=AISuggestionResponse)
def update_ai_suggestion(
    review_id: str,
    suggestion_id: str,
    suggestion_data: AISuggestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an AI suggestion (include/dismiss)."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify suggestions for a submitted review",
        )

    suggestion = db.query(AISuggestion).filter(
        AISuggestion.id == suggestion_id,
        AISuggestion.review_id == review_id,
    ).first()

    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found",
        )

    update_data = suggestion_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(suggestion, field, value)

    db.commit()
    db.refresh(suggestion)

    return suggestion
