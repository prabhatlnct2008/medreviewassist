from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models import GP, User
from app.schemas import GPCreate, GPUpdate, GPResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/gps", tags=["GPs"])


@router.get("", response_model=list[GPResponse])
def list_gps(
    search: Optional[str] = Query(None, description="Search by name or practice"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List GPs with optional search."""
    query = db.query(GP).filter(GP.created_by_id == current_user.id)

    if search:
        query = query.filter(
            GP.name.ilike(f"%{search}%") | GP.practice_name.ilike(f"%{search}%")
        )

    gps = query.order_by(GP.name).all()
    return gps


@router.post("", response_model=GPResponse, status_code=status.HTTP_201_CREATED)
def create_gp(
    gp_data: GPCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new GP."""
    gp = GP(
        **gp_data.model_dump(),
        created_by_id=current_user.id,
    )
    db.add(gp)
    db.commit()
    db.refresh(gp)
    return gp


@router.get("/{gp_id}", response_model=GPResponse)
def get_gp(
    gp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a GP by ID."""
    gp = db.query(GP).filter(
        GP.id == gp_id,
        GP.created_by_id == current_user.id,
    ).first()

    if not gp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GP not found",
        )

    return gp


@router.put("/{gp_id}", response_model=GPResponse)
def update_gp(
    gp_id: str,
    gp_data: GPUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a GP."""
    gp = db.query(GP).filter(
        GP.id == gp_id,
        GP.created_by_id == current_user.id,
    ).first()

    if not gp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GP not found",
        )

    update_data = gp_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gp, field, value)

    db.commit()
    db.refresh(gp)
    return gp
