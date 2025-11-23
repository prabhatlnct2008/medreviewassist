"""User settings model for storing user preferences and report templates."""
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class UserSettings(Base, UUIDMixin, TimestampMixin):
    """Model for storing user-specific settings and templates."""

    __tablename__ = "user_settings"

    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Report templates - JSON containing section templates
    hmr_template = Column(JSON, nullable=True)
    rmmr_template = Column(JSON, nullable=True)

    # User preferences
    preferences = Column(JSON, nullable=True, default=dict)

    # Signature line for reports
    signature_line = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", backref="settings")

    @classmethod
    def default_hmr_template(cls) -> dict:
        """Return default HMR report template sections."""
        return {
            "patient_details": {
                "heading": "Patient Details",
                "template": "**Patient Name:** {patient_name}\n**Date of Birth:** {dob}\n**Age:** {age} years\n**Sex:** {sex}\n**Address:** {address}\n\n**Referring GP:** Dr {gp_name}\n**Practice:** {practice_name}\n\n**Review Type:** HMR\n**Interview Date:** {interview_date}",
                "instructions": "Include patient demographics, GP details, and review information.",
            },
            "reason_for_review": {
                "heading": "Reason for Review",
                "template": "{reason_for_referral}\n\n**Patient Goals & Concerns:**\n{patient_goals}",
                "instructions": "State the reason for referral and any specific patient concerns.",
            },
            "summary_of_findings": {
                "heading": "Summary of Findings",
                "template": "**Medical History:**\n{medical_history}\n\n**Presenting Issues:**\n{presenting_issues}\n\n**Allergies & Adverse Reactions:**\n{allergies}\n\n**Medication Adherence:**\n{adherence}\n\n**Current Medications:** {med_count} medications currently prescribed",
                "instructions": "Summarize clinical findings from the interview.",
            },
            "medication_recommendations": {
                "heading": "Medication Recommendations",
                "template": "Based on the review, the following recommendations are made:\n\n{recommendations}",
                "instructions": "List specific medication recommendations with rationale.",
            },
            "deprescribing": {
                "heading": "Deprescribing Considerations",
                "template": "**Deprescribing Recommendations:**\n{deprescribing_suggestions}\n\n**Recently Ceased Medications:**\n{ceased_medications}",
                "instructions": "Include any medications that could be reduced or stopped.",
            },
            "monitoring_followup": {
                "heading": "Monitoring & Follow-up",
                "template": "- Continue regular medication review as clinically indicated\n- Monitor for adverse effects and therapeutic response\n- Follow up with GP in 3-6 months or as needed\n\n{additional_monitoring}",
                "instructions": "Specify any monitoring requirements and follow-up timeframes.",
            },
            "patient_education": {
                "heading": "Patient Education",
                "template": "The patient has been provided with information about:\n- Proper use and administration of medications\n- Potential side effects to monitor\n- Importance of adherence to prescribed regimen\n- When to seek medical advice\n\n{additional_education}",
                "instructions": "Document education provided to the patient.",
            },
            "pharmacist_signoff": {
                "heading": "Pharmacist Sign-off",
                "template": "Reviewed by: {pharmacist_name}\nAHPRA: {ahpra_number}\nDate: {date}\n\n{signature}",
                "instructions": "Include pharmacist credentials and signature.",
            },
        }

    @classmethod
    def default_rmmr_template(cls) -> dict:
        """Return default RMMR report template sections."""
        return {
            "patient_details": {
                "heading": "Resident Details",
                "template": "**Resident Name:** {patient_name}\n**Date of Birth:** {dob}\n**Age:** {age} years\n**Sex:** {sex}\n**Facility:** {facility_name}\n**Room/Bed:** {room_bed}\n\n**Attending GP:** Dr {gp_name}\n**Practice:** {practice_name}\n\n**Review Type:** RMMR\n**Review Date:** {interview_date}",
                "instructions": "Include resident demographics, facility details, and GP information.",
            },
            "reason_for_review": {
                "heading": "Reason for Review",
                "template": "{reason_for_referral}\n\n**Goals of Care:**\n{patient_goals}",
                "instructions": "State the reason for the medication review and goals of care.",
            },
            "summary_of_findings": {
                "heading": "Summary of Findings",
                "template": "**Medical History:**\n{medical_history}\n\n**Current Clinical Issues:**\n{presenting_issues}\n\n**Allergies & Adverse Reactions:**\n{allergies}\n\n**Medication Administration:**\n{adherence}\n\n**Current Medications:** {med_count} medications currently prescribed",
                "instructions": "Summarize clinical findings from chart review and discussions.",
            },
            "medication_recommendations": {
                "heading": "Medication Recommendations",
                "template": "Based on the review, the following recommendations are made:\n\n{recommendations}",
                "instructions": "List specific medication recommendations with clinical rationale.",
            },
            "deprescribing": {
                "heading": "Deprescribing Considerations",
                "template": "**Deprescribing Opportunities:**\nConsider the following medications for deprescribing:\n{deprescribing_suggestions}\n\n**Recently Ceased:**\n{ceased_medications}",
                "instructions": "Identify medications that may be appropriate to reduce or cease, considering goals of care.",
            },
            "monitoring_followup": {
                "heading": "Monitoring & Follow-up",
                "template": "- Quarterly RMMR as per PBS requirements\n- Monitor for adverse effects and therapeutic response\n- Liaise with nursing staff regarding medication administration\n\n{additional_monitoring}",
                "instructions": "Specify monitoring requirements and follow-up schedule.",
            },
            "patient_education": {
                "heading": "Resident/Family Education",
                "template": "Education provided to:\n- Nursing staff regarding medication administration\n- Resident/family as appropriate\n\nKey points discussed:\n{additional_education}",
                "instructions": "Document education provided to resident, family, and staff.",
            },
            "pharmacist_signoff": {
                "heading": "Pharmacist Sign-off",
                "template": "Reviewed by: {pharmacist_name}\nAHPRA: {ahpra_number}\nDate: {date}\n\n{signature}",
                "instructions": "Include pharmacist credentials and signature.",
            },
        }

    @classmethod
    def default_preferences(cls) -> dict:
        """Return default user preferences."""
        return {
            "auto_save_interval": 30,  # seconds
            "show_ai_confidence": True,
            "default_review_type": "hmr",
            "email_copy_to_self": False,
            "date_format": "dd/MM/yyyy",
        }
