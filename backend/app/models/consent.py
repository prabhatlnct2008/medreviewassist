from sqlalchemy import Column, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin


class Consent(Base, UUIDMixin):
    __tablename__ = "consents"

    review_id = Column(String, ForeignKey("reviews.id"), unique=True, nullable=False)
    obtained = Column(Boolean, default=False)
    obtained_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    review = relationship("Review", back_populates="consent")
