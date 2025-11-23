"""Audit log API endpoints."""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Review, AuditLog
from app.services.audit_service import AuditService

router = APIRouter(prefix="/reviews/{review_id}/audit", tags=["audit"])


class AuditLogResponse(BaseModel):
    id: str
    review_id: str
    user_id: str
    user_name: str
    action: str
    details: dict
    created_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[AuditLogResponse])
async def get_audit_logs(
    review_id: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get audit logs for a review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.pharmacist_id == current_user.id,
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    service = AuditService(db)
    logs = service.get_logs(review_id, limit)

    return [
        {
            "id": log.id,
            "review_id": log.review_id,
            "user_id": log.user_id,
            "user_name": log.user.full_name if log.user else "Unknown",
            "action": log.action.value,
            "details": log.details or {},
            "created_at": log.created_at.isoformat() if log.created_at else datetime.utcnow().isoformat(),
        }
        for log in logs
    ]
