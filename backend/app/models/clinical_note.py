from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import UUIDMixin
from app.models.enums import ClinicalNoteSection


class ClinicalNote(Base, UUIDMixin):
    __tablename__ = "clinical_notes"

    review_id = Column(String, ForeignKey("reviews.id"), nullable=False, index=True)
    section_type = Column(Enum(ClinicalNoteSection), nullable=False)
    content = Column(Text, nullable=True)
    is_key_point = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    review = relationship("Review", back_populates="clinical_notes")
