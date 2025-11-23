from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.enums import ReviewType, ReviewStatus
from app.schemas.patient import PatientResponse
from app.schemas.gp import GPResponse


class ReviewBase(BaseModel):
    review_type: ReviewType
    reason_for_referral: Optional[str] = None
    interview_date: Optional[date] = None


class ReviewCreate(ReviewBase):
    patient_id: str
    gp_id: str


class ReviewUpdate(BaseModel):
    reason_for_referral: Optional[str] = None
    interview_date: Optional[date] = None
    gp_id: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: str
    patient_id: str
    pharmacist_id: str
    gp_id: str
    status: ReviewStatus
    finalized_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewSummary(BaseModel):
    id: str
    patient_name: str
    review_type: ReviewType
    gp_name: str
    status: ReviewStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewDetailResponse(ReviewResponse):
    patient: PatientResponse
    gp: GPResponse

    class Config:
        from_attributes = True


class PaginatedReviews(BaseModel):
    items: List[ReviewSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
