from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import UUIDMixin
from app.models.enums import SuggestionSeverity, SuggestionCategory


class AISuggestion(Base, UUIDMixin):
    __tablename__ = "ai_suggestions"

    review_id = Column(String, ForeignKey("reviews.id"), nullable=False, index=True)
    severity = Column(Enum(SuggestionSeverity), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(Enum(SuggestionCategory), nullable=False)
    description = Column(Text, nullable=False)
    involved_medications = Column(JSON, nullable=True)
    clinical_rationale = Column(Text, nullable=True)
    evidence_summary = Column(Text, nullable=True)
    suggested_text = Column(Text, nullable=True)
    is_included_in_report = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    review = relationship("Review", back_populates="ai_suggestions")
