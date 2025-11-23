from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Review, ClinicalNote, User, ReviewStatus, ClinicalNoteSection
from app.schemas import ClinicalNoteUpdate, ClinicalNoteResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews/{review_id}/notes", tags=["Clinical Notes"])


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


@router.get("", response_model=List[ClinicalNoteResponse])
def get_clinical_notes(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all clinical notes for a review."""
    get_review_or_404(review_id, current_user.id, db)

    notes = (
        db.query(ClinicalNote)
        .filter(ClinicalNote.review_id == review_id)
        .all()
    )

    return notes


@router.put("/{section}", response_model=ClinicalNoteResponse)
def update_clinical_note(
    review_id: str,
    section: ClinicalNoteSection,
    note_data: ClinicalNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a clinical note section."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    note = db.query(ClinicalNote).filter(
        ClinicalNote.review_id == review_id,
        ClinicalNote.section_type == section,
    ).first()

    if not note:
        # Create if doesn't exist
        note = ClinicalNote(
            review_id=review_id,
            section_type=section,
        )
        db.add(note)

    note.content = note_data.content
    note.is_key_point = note_data.is_key_point

    db.commit()
    db.refresh(note)

    return note
