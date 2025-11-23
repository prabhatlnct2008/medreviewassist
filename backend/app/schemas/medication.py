from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class MedicationBase(BaseModel):
    drug_name: str = Field(..., min_length=1, max_length=255)
    strength: Optional[str] = None
    form: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: str = "oral"
    indication: Optional[str] = None
    start_date: Optional[date] = None
    prescriber: Optional[str] = None
    comments: Optional[str] = None
    is_ceased: bool = False


class MedicationCreate(MedicationBase):
    order_index: Optional[int] = 0


class MedicationUpdate(BaseModel):
    drug_name: Optional[str] = Field(None, min_length=1, max_length=255)
    strength: Optional[str] = None
    form: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    indication: Optional[str] = None
    start_date: Optional[date] = None
    prescriber: Optional[str] = None
    comments: Optional[str] = None
    is_ceased: Optional[bool] = None
    order_index: Optional[int] = None


class MedicationResponse(MedicationBase):
    id: str
    review_id: str
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class BulkMedicationCreate(BaseModel):
    medications: List[MedicationCreate]


class ParseMedicationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw text to parse into medications")


class ParsedMedication(BaseModel):
    drug_name: str
    strength: Optional[str] = None
    form: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    indication: Optional[str] = None
    raw_text: str
