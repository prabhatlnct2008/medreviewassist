from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.enums import Sex, ResidentialSetting


class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date
    sex: Sex
    address: Optional[str] = None
    medicare_number: Optional[str] = None
    residential_setting: ResidentialSetting = ResidentialSetting.HOME


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    date_of_birth: Optional[date] = None
    sex: Optional[Sex] = None
    address: Optional[str] = None
    medicare_number: Optional[str] = None
    residential_setting: Optional[ResidentialSetting] = None


class PatientResponse(PatientBase):
    id: str
    created_by_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    id: str
    full_name: str
    date_of_birth: date
    sex: Sex
    residential_setting: ResidentialSetting
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedPatients(BaseModel):
    items: List[PatientListResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
