from sqlalchemy import Column, String, Date, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Medication(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "medications"

    review_id = Column(String, ForeignKey("reviews.id"), nullable=False, index=True)
    drug_name = Column(String(255), nullable=False)
    strength = Column(String(100), nullable=True)
    form = Column(String(100), nullable=True)
    dose = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    route = Column(String(50), default="oral")
    indication = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    prescriber = Column(String(255), nullable=True)
    comments = Column(Text, nullable=True)
    is_ceased = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    # Relationships
    review = relationship("Review", back_populates="medications")
