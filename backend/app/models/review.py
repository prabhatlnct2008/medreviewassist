from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin
from app.models.enums import ReviewType, ReviewStatus


class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"

    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    pharmacist_id = Column(String, ForeignKey("users.id"), nullable=False)
    gp_id = Column(String, ForeignKey("gps.id"), nullable=False)
    review_type = Column(Enum(ReviewType), nullable=False)
    status = Column(Enum(ReviewStatus), default=ReviewStatus.DRAFT)
    reason_for_referral = Column(Text, nullable=True)
    interview_date = Column(Date, nullable=True)
    finalized_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="reviews")
    pharmacist = relationship("User", back_populates="reviews")
    gp = relationship("GP", back_populates="reviews")
    medications = relationship("Medication", back_populates="review", cascade="all, delete-orphan")
    clinical_notes = relationship("ClinicalNote", back_populates="review", cascade="all, delete-orphan")
    ai_suggestions = relationship("AISuggestion", back_populates="review", cascade="all, delete-orphan")
    report_draft = relationship("ReportDraft", back_populates="review", uselist=False, cascade="all, delete-orphan")
    consent = relationship("Consent", back_populates="review", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="review", cascade="all, delete-orphan")
