from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from math import ceil
from app.core.database import get_db
from app.models import Review, Patient, GP, User, ReviewStatus, ReviewType, ClinicalNote, Consent, ClinicalNoteSection
from app.schemas import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewDetailResponse,
    ReviewSummary,
    PaginatedReviews,
    MessageResponse,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=PaginatedReviews)
def list_reviews(
    search: Optional[str] = Query(None, description="Search by patient name or GP"),
    review_type: Optional[ReviewType] = Query(None),
    status_filter: Optional[ReviewStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List reviews with filters and pagination."""
    query = (
        db.query(Review)
        .options(joinedload(Review.patient), joinedload(Review.gp))
        .filter(Review.pharmacist_id == current_user.id)
    )

    if search:
        query = query.join(Patient).join(GP).filter(
            Patient.full_name.ilike(f"%{search}%") | GP.name.ilike(f"%{search}%")
        )

    if review_type:
        query = query.filter(Review.review_type == review_type)

    if status_filter:
        query = query.filter(Review.status == status_filter)

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1

    reviews = (
        query.order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedReviews(
        items=[
            ReviewSummary(
                id=r.id,
                patient_name=r.patient.full_name,
                review_type=r.review_type,
                gp_name=r.gp.name,
                status=r.status,
                created_at=r.created_at,
            )
            for r in reviews
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new review."""
    # Verify patient exists and belongs to user
    patient = db.query(Patient).filter(
        Patient.id == review_data.patient_id,
        Patient.created_by_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Verify GP exists and belongs to user
    gp = db.query(GP).filter(
        GP.id == review_data.gp_id,
        GP.created_by_id == current_user.id,
    ).first()

    if not gp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GP not found",
        )

    review = Review(
        **review_data.model_dump(),
        pharmacist_id=current_user.id,
        status=ReviewStatus.DRAFT,
    )
    db.add(review)
    db.flush()

    # Create empty clinical notes for each section
    for section in ClinicalNoteSection:
        note = ClinicalNote(
            review_id=review.id,
            section_type=section,
            content="",
        )
        db.add(note)

    # Create empty consent record
    consent = Consent(review_id=review.id)
    db.add(consent)

    db.commit()
    db.refresh(review)
    return review


@router.get("/{review_id}", response_model=ReviewDetailResponse)
def get_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a review by ID with full details."""
    review = (
        db.query(Review)
        .options(joinedload(Review.patient), joinedload(Review.gp))
        .filter(
            Review.id == review_id,
            Review.pharmacist_id == current_user.id,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.status == ReviewStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a submitted review",
        )

    update_data = review_data.model_dump(exclude_unset=True)

    # If updating GP, verify it exists
    if "gp_id" in update_data:
        gp = db.query(GP).filter(
            GP.id == update_data["gp_id"],
            GP.created_by_id == current_user.id,
        ).first()
        if not gp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GP not found",
            )

    for field, value in update_data.items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}", response_model=MessageResponse)
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a draft review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.status != ReviewStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft reviews can be deleted",
        )

    db.delete(review)
    db.commit()

    return MessageResponse(message="Review deleted successfully")
