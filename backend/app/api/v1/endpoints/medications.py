from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Review, Medication, User, ReviewStatus
from app.schemas import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    BulkMedicationCreate,
    ParseMedicationRequest,
    ParsedMedication,
    MessageResponse,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews/{review_id}/medications", tags=["Medications"])


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


@router.get("", response_model=List[MedicationResponse])
def list_medications(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all medications for a review."""
    get_review_or_404(review_id, current_user.id, db)

    medications = (
        db.query(Medication)
        .filter(Medication.review_id == review_id)
        .order_by(Medication.order_index, Medication.created_at)
        .all()
    )

    return medications


@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(
    review_id: str,
    medication_data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a medication to a review."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    # Get max order_index
    max_index = db.query(Medication).filter(
        Medication.review_id == review_id
    ).count()

    medication = Medication(
        **medication_data.model_dump(),
        review_id=review_id,
        order_index=medication_data.order_index or max_index,
    )

    db.add(medication)
    db.commit()
    db.refresh(medication)

    return medication


@router.post("/bulk", response_model=List[MedicationResponse], status_code=status.HTTP_201_CREATED)
def create_medications_bulk(
    review_id: str,
    bulk_data: BulkMedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add multiple medications to a review."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    max_index = db.query(Medication).filter(
        Medication.review_id == review_id
    ).count()

    medications = []
    for i, med_data in enumerate(bulk_data.medications):
        medication = Medication(
            **med_data.model_dump(),
            review_id=review_id,
            order_index=max_index + i,
        )
        db.add(medication)
        medications.append(medication)

    db.commit()

    for med in medications:
        db.refresh(med)

    return medications


@router.post("/parse", response_model=List[ParsedMedication])
def parse_medications(
    review_id: str,
    parse_request: ParseMedicationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Parse text into structured medications (placeholder for OpenAI integration)."""
    get_review_or_404(review_id, current_user.id, db)

    # TODO: Integrate with OpenAI for actual parsing
    # For now, do basic line-by-line parsing
    lines = parse_request.text.strip().split("\n")
    parsed = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Basic parsing - try to extract drug name and dosage
        parts = line.split()
        if parts:
            drug_name = parts[0]
            strength = parts[1] if len(parts) > 1 else None
            frequency = parts[2] if len(parts) > 2 else None

            parsed.append(ParsedMedication(
                drug_name=drug_name,
                strength=strength,
                frequency=frequency,
                raw_text=line,
            ))

    return parsed


@router.put("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    review_id: str,
    medication_id: str,
    medication_data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a medication."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.review_id == review_id,
    ).first()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found",
        )

    update_data = medication_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medication, field, value)

    db.commit()
    db.refresh(medication)

    return medication


@router.delete("/{medication_id}", response_model=MessageResponse)
def delete_medication(
    review_id: str,
    medication_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a medication."""
    review = get_review_or_404(review_id, current_user.id, db)

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted review",
        )

    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.review_id == review_id,
    ).first()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found",
        )

    db.delete(medication)
    db.commit()

    return MessageResponse(message="Medication deleted successfully")
