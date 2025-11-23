from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from math import ceil
from app.core.database import get_db
from app.models import Patient, Review, User
from app.schemas import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PaginatedPatients,
    PatientListResponse,
)
from app.schemas.review import ReviewSummary
from app.api.deps import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=PaginatedPatients)
def list_patients(
    search: Optional[str] = Query(None, description="Search by name or medicare number"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List patients with search and pagination."""
    query = db.query(Patient).filter(Patient.created_by_id == current_user.id)

    if search:
        search_filter = or_(
            Patient.full_name.ilike(f"%{search}%"),
            Patient.medicare_number.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1

    patients = (
        query.order_by(Patient.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedPatients(
        items=[PatientListResponse.model_validate(p) for p in patients],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new patient."""
    patient = Patient(
        **patient_data.model_dump(),
        created_by_id=current_user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a patient by ID."""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.created_by_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a patient."""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.created_by_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    update_data = patient_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}/reviews", response_model=list[ReviewSummary])
def get_patient_reviews(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all reviews for a patient."""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.created_by_id == current_user.id,
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    reviews = db.query(Review).filter(Review.patient_id == patient_id).order_by(Review.created_at.desc()).all()

    return [
        ReviewSummary(
            id=r.id,
            patient_name=patient.full_name,
            review_type=r.review_type,
            gp_name=r.gp.name if r.gp else "Unknown",
            status=r.status,
            created_at=r.created_at,
        )
        for r in reviews
    ]
