from sqlalchemy import Column, String, Enum, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import UUIDMixin
from app.models.enums import AuditAction


class AuditLog(Base, UUIDMixin):
    __tablename__ = "audit_logs"

    review_id = Column(String, ForeignKey("reviews.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(AuditAction), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    review = relationship("Review", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
