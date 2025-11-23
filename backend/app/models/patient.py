from sqlalchemy import Column, String, Date, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin
from app.models.enums import Sex, ResidentialSetting


class Patient(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "patients"

    full_name = Column(String(255), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(Enum(Sex), nullable=False)
    address = Column(Text, nullable=True)
    medicare_number = Column(String(20), nullable=True)
    residential_setting = Column(Enum(ResidentialSetting), default=ResidentialSetting.HOME)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    created_by = relationship("User", back_populates="patients")
    reviews = relationship("Review", back_populates="patient", cascade="all, delete-orphan")
