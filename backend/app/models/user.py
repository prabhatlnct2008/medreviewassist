from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin
from app.models.enums import UserRole


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PHARMACIST, nullable=False)
    ahpra_number = Column(String(50), nullable=True)
    organisation_name = Column(String(255), nullable=True)
    conducts_hmr = Column(Boolean, default=True)
    conducts_rmmr = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    patients = relationship("Patient", back_populates="created_by")
    reviews = relationship("Review", back_populates="pharmacist")
    gps = relationship("GP", back_populates="created_by")
    audit_logs = relationship("AuditLog", back_populates="user")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
