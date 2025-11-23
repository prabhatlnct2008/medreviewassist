from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class GP(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gps"

    name = Column(String(255), nullable=False)
    practice_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    fax = Column(String(50), nullable=True)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    created_by = relationship("User", back_populates="gps")
    reviews = relationship("Review", back_populates="gp")
