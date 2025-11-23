from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.enums import SuggestionSeverity, SuggestionCategory


class AISuggestionBase(BaseModel):
    severity: SuggestionSeverity
    title: str
    category: SuggestionCategory
    description: str
    involved_medications: Optional[List[str]] = None
    clinical_rationale: Optional[str] = None
    evidence_summary: Optional[str] = None
    suggested_text: Optional[str] = None


class AISuggestionUpdate(BaseModel):
    is_included_in_report: Optional[bool] = None
    is_dismissed: Optional[bool] = None


class AISuggestionResponse(AISuggestionBase):
    id: str
    review_id: str
    is_included_in_report: bool
    is_dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True
