"""Schemas for user settings and templates."""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class TemplateSectionSchema(BaseModel):
    """Schema for a single template section."""
    heading: str
    template: str
    instructions: str


class TemplateSchema(BaseModel):
    """Schema for a report template."""
    patient_details: Optional[TemplateSectionSchema] = None
    reason_for_review: Optional[TemplateSectionSchema] = None
    summary_of_findings: Optional[TemplateSectionSchema] = None
    medication_recommendations: Optional[TemplateSectionSchema] = None
    deprescribing: Optional[TemplateSectionSchema] = None
    monitoring_followup: Optional[TemplateSectionSchema] = None
    patient_education: Optional[TemplateSectionSchema] = None
    pharmacist_signoff: Optional[TemplateSectionSchema] = None


class PreferencesSchema(BaseModel):
    """Schema for user preferences."""
    auto_save_interval: int = Field(default=30, ge=5, le=300)
    show_ai_confidence: bool = True
    default_review_type: str = "hmr"
    email_copy_to_self: bool = False
    date_format: str = "dd/MM/yyyy"


class UserSettingsResponse(BaseModel):
    """Response schema for user settings."""
    id: str
    user_id: str
    hmr_template: Optional[Dict[str, Any]] = None
    rmmr_template: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    signature_line: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    """Update schema for user settings."""
    hmr_template: Optional[Dict[str, Any]] = None
    rmmr_template: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    signature_line: Optional[str] = None


class TemplateUpdateRequest(BaseModel):
    """Request to update a specific template."""
    template_type: str = Field(..., pattern="^(hmr|rmmr)$")
    template: Dict[str, Any]


class ResetTemplateRequest(BaseModel):
    """Request to reset a template to defaults."""
    template_type: str = Field(..., pattern="^(hmr|rmmr|all)$")


class ProfileUpdateRequest(BaseModel):
    """Request to update user profile settings."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    ahpra_number: Optional[str] = Field(None, max_length=50)
    organisation_name: Optional[str] = Field(None, max_length=255)
    conducts_hmr: Optional[bool] = None
    conducts_rmmr: Optional[bool] = None
    signature_line: Optional[str] = Field(None, max_length=500)
