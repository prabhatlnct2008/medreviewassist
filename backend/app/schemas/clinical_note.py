from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import ClinicalNoteSection


class ClinicalNoteBase(BaseModel):
    content: Optional[str] = None
    is_key_point: bool = False


class ClinicalNoteUpdate(ClinicalNoteBase):
    pass


class ClinicalNoteResponse(ClinicalNoteBase):
    id: str
    review_id: str
    section_type: ClinicalNoteSection
    updated_at: datetime

    class Config:
        from_attributes = True
