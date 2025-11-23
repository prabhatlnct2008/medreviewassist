"""Report generation service."""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Review, Medication, ClinicalNote, AISuggestion, ReportDraft
from app.models.enums import ClinicalNoteSection


class ReportService:
    """Service for generating and managing report drafts."""

    def __init__(self, db: Session):
        self.db = db

    def generate_draft(self, review: Review) -> ReportDraft:
        """Generate a report draft from review data."""
        # Gather all data
        medications = self.db.query(Medication).filter(
            Medication.review_id == review.id,
            Medication.is_ceased == False
        ).all()

        ceased_medications = self.db.query(Medication).filter(
            Medication.review_id == review.id,
            Medication.is_ceased == True
        ).all()

        clinical_notes = self.db.query(ClinicalNote).filter(
            ClinicalNote.review_id == review.id
        ).all()

        included_suggestions = self.db.query(AISuggestion).filter(
            AISuggestion.review_id == review.id,
            AISuggestion.is_included_in_report == True,
            AISuggestion.is_dismissed == False
        ).all()

        # Create notes dictionary
        notes_dict = {note.section: note.content for note in clinical_notes}

        # Generate sections
        sections = {
            "patient_details": {
                "content": self._generate_patient_details(review, notes_dict),
                "reviewed": False,
            },
            "reason_for_review": {
                "content": self._generate_reason_for_review(review, notes_dict),
                "reviewed": False,
            },
            "summary_of_findings": {
                "content": self._generate_summary_of_findings(notes_dict, medications),
                "reviewed": False,
            },
            "medication_recommendations": {
                "content": self._generate_medication_recommendations(included_suggestions),
                "reviewed": False,
            },
            "deprescribing": {
                "content": self._generate_deprescribing(included_suggestions, ceased_medications),
                "reviewed": False,
            },
            "monitoring_followup": {
                "content": self._generate_monitoring_followup(included_suggestions),
                "reviewed": False,
            },
            "patient_education": {
                "content": self._generate_patient_education(notes_dict),
                "reviewed": False,
            },
            "pharmacist_signoff": {
                "content": "",
                "reviewed": False,
            },
        }

        # Check for existing draft
        existing_draft = self.db.query(ReportDraft).filter(
            ReportDraft.review_id == review.id
        ).first()

        if existing_draft:
            existing_draft.sections = sections
            existing_draft.generated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing_draft)
            return existing_draft

        # Create new draft
        draft = ReportDraft(
            review_id=review.id,
            sections=sections,
            generated_at=datetime.utcnow(),
        )
        self.db.add(draft)
        self.db.commit()
        self.db.refresh(draft)
        return draft

    def _generate_patient_details(self, review: Review, notes: dict) -> str:
        """Generate patient details section."""
        patient = review.patient
        gp = review.gp

        lines = []
        lines.append(f"**Patient Name:** {patient.full_name}")
        if patient.date_of_birth:
            lines.append(f"**Date of Birth:** {patient.date_of_birth.strftime('%d/%m/%Y')}")
        if patient.age:
            lines.append(f"**Age:** {patient.age} years")
        if patient.sex:
            lines.append(f"**Sex:** {patient.sex}")
        if patient.address:
            lines.append(f"**Address:** {patient.address}")

        lines.append("")
        lines.append(f"**Referring GP:** Dr {gp.name}")
        if gp.practice_name:
            lines.append(f"**Practice:** {gp.practice_name}")

        lines.append("")
        lines.append(f"**Review Type:** {review.review_type.value.upper()}")
        if review.interview_date:
            lines.append(f"**Interview Date:** {review.interview_date.strftime('%d/%m/%Y')}")

        return "\n".join(lines)

    def _generate_reason_for_review(self, review: Review, notes: dict) -> str:
        """Generate reason for review section."""
        lines = []

        if review.reason_for_referral:
            lines.append(review.reason_for_referral)
        else:
            lines.append("Medication review requested by referring GP.")

        # Add patient goals if available
        if notes.get(ClinicalNoteSection.PATIENT_GOALS):
            lines.append("")
            lines.append("**Patient Goals & Concerns:**")
            lines.append(notes[ClinicalNoteSection.PATIENT_GOALS])

        return "\n".join(lines)

    def _generate_summary_of_findings(self, notes: dict, medications: List[Medication]) -> str:
        """Generate summary of findings section."""
        lines = []

        # Medical history
        if notes.get(ClinicalNoteSection.MEDICAL_HISTORY):
            lines.append("**Medical History:**")
            lines.append(notes[ClinicalNoteSection.MEDICAL_HISTORY])
            lines.append("")

        # Presenting issues
        if notes.get(ClinicalNoteSection.PRESENTING_ISSUES):
            lines.append("**Presenting Issues:**")
            lines.append(notes[ClinicalNoteSection.PRESENTING_ISSUES])
            lines.append("")

        # Allergies
        if notes.get(ClinicalNoteSection.ALLERGIES):
            lines.append("**Allergies & Adverse Reactions:**")
            lines.append(notes[ClinicalNoteSection.ALLERGIES])
            lines.append("")

        # Adherence
        if notes.get(ClinicalNoteSection.ADHERENCE):
            lines.append("**Medication Adherence:**")
            lines.append(notes[ClinicalNoteSection.ADHERENCE])
            lines.append("")

        # Current medications summary
        lines.append(f"**Current Medications:** {len(medications)} medications currently prescribed")
        for med in medications[:5]:  # Show first 5
            med_line = f"- {med.drug_name}"
            if med.strength:
                med_line += f" {med.strength}"
            if med.indication:
                med_line += f" (for {med.indication})"
            lines.append(med_line)

        if len(medications) > 5:
            lines.append(f"- ... and {len(medications) - 5} more")

        if not lines:
            return "Clinical assessment summary to be completed."

        return "\n".join(lines)

    def _generate_medication_recommendations(self, suggestions: List[AISuggestion]) -> str:
        """Generate medication recommendations section."""
        # Filter for dosing, interaction, and other medication suggestions
        relevant = [s for s in suggestions if s.category.value in ["dosing", "interaction", "other"]]

        if not relevant:
            return "No specific medication recommendations at this time. Continue current medications as prescribed."

        lines = []
        for s in relevant:
            lines.append(f"**{s.title}**")
            if s.suggested_text:
                lines.append(s.suggested_text)
            elif s.description:
                lines.append(s.description)
            lines.append("")

        return "\n".join(lines)

    def _generate_deprescribing(self, suggestions: List[AISuggestion], ceased: List[Medication]) -> str:
        """Generate deprescribing section."""
        lines = []

        # Deprescribing suggestions
        deprescribing = [s for s in suggestions if s.category.value == "deprescribing"]
        if deprescribing:
            lines.append("**Deprescribing Recommendations:**")
            for s in deprescribing:
                lines.append(f"\n*{s.title}*")
                if s.suggested_text:
                    lines.append(s.suggested_text)
                elif s.description:
                    lines.append(s.description)
            lines.append("")

        # Already ceased medications
        if ceased:
            lines.append("**Recently Ceased Medications:**")
            for med in ceased:
                lines.append(f"- {med.drug_name} {med.strength or ''}")
            lines.append("")

        if not lines:
            return "No deprescribing recommendations at this time. All current medications appear appropriate to continue."

        return "\n".join(lines)

    def _generate_monitoring_followup(self, suggestions: List[AISuggestion]) -> str:
        """Generate monitoring and follow-up section."""
        lines = []

        # Monitoring suggestions
        monitoring = [s for s in suggestions if s.category.value == "monitoring"]
        if monitoring:
            for s in monitoring:
                lines.append(f"- **{s.title}:** {s.suggested_text or s.description}")

        # Default recommendations
        if not lines:
            lines.append("- Continue regular medication review as clinically indicated")
            lines.append("- Monitor for adverse effects and therapeutic response")
            lines.append("- Follow up with GP in 3-6 months or as needed")

        return "\n".join(lines)

    def _generate_patient_education(self, notes: dict) -> str:
        """Generate patient education section."""
        lines = []

        # Adherence-related education
        if notes.get(ClinicalNoteSection.ADHERENCE):
            lines.append("Patient has been counselled on medication adherence strategies.")
            lines.append("")

        lines.append("The patient has been provided with information about:")
        lines.append("- Proper use and administration of medications")
        lines.append("- Potential side effects to monitor")
        lines.append("- Importance of adherence to prescribed regimen")
        lines.append("- When to seek medical advice")

        return "\n".join(lines)

    def get_draft(self, review_id: str) -> Optional[ReportDraft]:
        """Get existing report draft for a review."""
        return self.db.query(ReportDraft).filter(
            ReportDraft.review_id == review_id
        ).first()

    def update_draft_section(
        self, draft: ReportDraft, section: str, content: str, reviewed: bool = False
    ) -> ReportDraft:
        """Update a specific section of the draft."""
        valid_sections = list(ReportDraft.default_sections().keys())

        if section not in valid_sections:
            raise ValueError(f"Invalid section: {section}")

        # Update the section
        sections = dict(draft.sections)
        sections[section] = {"content": content, "reviewed": reviewed}
        draft.sections = sections
        draft.last_edited_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(draft)
        return draft

    def mark_section_reviewed(self, draft: ReportDraft, section: str) -> ReportDraft:
        """Mark a section as reviewed."""
        valid_sections = list(ReportDraft.default_sections().keys())

        if section not in valid_sections:
            raise ValueError(f"Invalid section: {section}")

        sections = dict(draft.sections)
        if section in sections:
            sections[section]["reviewed"] = True
            draft.sections = sections
            self.db.commit()
            self.db.refresh(draft)

        return draft
