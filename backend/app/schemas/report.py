from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime


class ReportSection(BaseModel):
    content: str = ""
    reviewed: bool = False


class ReportSections(BaseModel):
    patient_details: ReportSection = Field(default_factory=ReportSection)
    reason_for_review: ReportSection = Field(default_factory=ReportSection)
    summary_of_findings: ReportSection = Field(default_factory=ReportSection)
    medication_recommendations: ReportSection = Field(default_factory=ReportSection)
    deprescribing: ReportSection = Field(default_factory=ReportSection)
    monitoring_followup: ReportSection = Field(default_factory=ReportSection)
    patient_education: ReportSection = Field(default_factory=ReportSection)
    pharmacist_signoff: ReportSection = Field(default_factory=ReportSection)


class ReportDraftResponse(BaseModel):
    id: str
    review_id: str
    sections: Dict
    generated_at: Optional[datetime]
    last_edited_at: Optional[datetime]
    is_finalized: bool

    class Config:
        from_attributes = True


class ReportDraftUpdate(BaseModel):
    sections: Dict


class FinalizeRequest(BaseModel):
    all_sections_reviewed: bool = Field(..., description="Confirm all sections reviewed")
    medication_list_verified: bool = Field(..., description="Confirm medication list verified")
    clinical_responsibility_accepted: bool = Field(..., description="Accept clinical responsibility")
    delivery_method: str = Field(..., description="email, download, or printed")


class SendReportRequest(BaseModel):
    recipient_email: Optional[str] = None


class ReopenRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Reason for reopening")
