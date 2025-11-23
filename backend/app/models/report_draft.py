from sqlalchemy import Column, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin


class ReportDraft(Base, UUIDMixin):
    __tablename__ = "report_drafts"

    review_id = Column(String, ForeignKey("reviews.id"), unique=True, nullable=False)
    sections = Column(JSON, nullable=False, default=dict)
    generated_at = Column(DateTime, nullable=True)
    last_edited_at = Column(DateTime, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    is_finalized = Column(Boolean, default=False)

    # Relationships
    review = relationship("Review", back_populates="report_draft")

    @staticmethod
    def default_sections():
        """Return default empty sections structure."""
        return {
            "patient_details": {"content": "", "reviewed": False},
            "reason_for_review": {"content": "", "reviewed": False},
            "summary_of_findings": {"content": "", "reviewed": False},
            "medication_recommendations": {"content": "", "reviewed": False},
            "deprescribing": {"content": "", "reviewed": False},
            "monitoring_followup": {"content": "", "reviewed": False},
            "patient_education": {"content": "", "reviewed": False},
            "pharmacist_signoff": {"content": "", "reviewed": False},
        }
