from openai import OpenAI
from typing import List, Optional
from app.core.config import settings
from app.models import Medication, ClinicalNote, AISuggestion, SuggestionSeverity, SuggestionCategory
import json


class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def generate_suggestions(
        self,
        medications: List[Medication],
        clinical_notes: List[ClinicalNote],
        patient_age: Optional[int] = None,
        patient_sex: Optional[str] = None,
    ) -> List[dict]:
        """Generate clinical suggestions based on medications and notes."""
        if not self.client:
            return self._generate_mock_suggestions(medications)

        # Build the prompt
        med_list = "\n".join([
            f"- {m.drug_name} {m.strength or ''} {m.frequency or ''} ({m.indication or 'no indication'})"
            for m in medications if not m.is_ceased
        ])

        notes_text = "\n".join([
            f"{n.section_type.value}: {n.content or 'No notes'}"
            for n in clinical_notes if n.content
        ])

        patient_info = ""
        if patient_age:
            patient_info += f"Patient age: {patient_age} years. "
        if patient_sex:
            patient_info += f"Sex: {patient_sex}. "

        prompt = f"""You are an Australian clinical pharmacist assistant providing medication review decision support.

{patient_info}

CURRENT MEDICATIONS:
{med_list or 'No medications listed'}

CLINICAL NOTES:
{notes_text or 'No clinical notes'}

Analyze this medication regimen and identify potential issues. For each issue, provide:
1. Severity: "info", "moderate", or "high"
2. Category: "interaction", "dosing", "deprescribing", "adherence", "monitoring", or "other"
3. A short title
4. A detailed description
5. Clinical rationale
6. Which medications are involved
7. Suggested text for the pharmacist's report

Focus on Australian guidelines (TGA, PBS). Consider:
- Drug-drug interactions
- Age-appropriate dosing
- Deprescribing opportunities
- Monitoring requirements
- Adherence concerns

Respond in JSON format:
{{
  "suggestions": [
    {{
      "severity": "high|moderate|info",
      "category": "interaction|dosing|deprescribing|adherence|monitoring|other",
      "title": "Short title",
      "description": "Detailed description",
      "clinical_rationale": "Why this matters",
      "involved_medications": ["Drug A", "Drug B"],
      "suggested_text": "Suggested wording for the report"
    }}
  ]
}}"""

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a clinical pharmacy decision support assistant. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
            )

            content = response.choices[0].message.content
            # Parse JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            data = json.loads(content)
            return data.get("suggestions", [])

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._generate_mock_suggestions(medications)

    def _generate_mock_suggestions(self, medications: List[Medication]) -> List[dict]:
        """Generate mock suggestions when OpenAI is not available."""
        suggestions = []

        med_names = [m.drug_name.lower() for m in medications if not m.is_ceased]

        # Check for common issues
        if any('metformin' in m for m in med_names) and any('contrast' in m or 'iodine' in m for m in med_names):
            suggestions.append({
                "severity": "high",
                "category": "interaction",
                "title": "Metformin & Contrast Media",
                "description": "Metformin should be withheld before and after iodinated contrast media procedures.",
                "clinical_rationale": "Risk of contrast-induced nephropathy and lactic acidosis.",
                "involved_medications": ["Metformin"],
                "suggested_text": "Consider withholding metformin 48 hours before and after any procedures involving iodinated contrast media."
            })

        if len([m for m in medications if not m.is_ceased]) > 5:
            suggestions.append({
                "severity": "moderate",
                "category": "deprescribing",
                "title": "Polypharmacy Review",
                "description": f"Patient is on {len([m for m in medications if not m.is_ceased])} medications. Consider reviewing for deprescribing opportunities.",
                "clinical_rationale": "Polypharmacy increases risk of adverse drug events, drug interactions, and medication non-adherence.",
                "involved_medications": [m.drug_name for m in medications[:3]],
                "suggested_text": "Given the number of medications, a comprehensive medication review is recommended to identify any that may be safely deprescribed."
            })

        if any('ppi' in m or 'omeprazole' in m or 'pantoprazole' in m or 'esomeprazole' in m for m in med_names):
            suggestions.append({
                "severity": "info",
                "category": "deprescribing",
                "title": "Long-term PPI Use",
                "description": "Consider reviewing the ongoing need for proton pump inhibitor therapy.",
                "clinical_rationale": "Long-term PPI use is associated with increased risk of fractures, hypomagnesemia, and C. difficile infection.",
                "involved_medications": ["PPI"],
                "suggested_text": "If PPI has been used long-term without clear indication, consider a trial of step-down therapy or discontinuation."
            })

        if any('warfarin' in m for m in med_names):
            suggestions.append({
                "severity": "moderate",
                "category": "monitoring",
                "title": "Warfarin Monitoring",
                "description": "Ensure regular INR monitoring is in place.",
                "clinical_rationale": "Warfarin has a narrow therapeutic index and requires regular INR monitoring.",
                "involved_medications": ["Warfarin"],
                "suggested_text": "Recommend regular INR monitoring. Target range should be confirmed based on indication."
            })

        if not suggestions:
            suggestions.append({
                "severity": "info",
                "category": "other",
                "title": "Medication Review Complete",
                "description": "No significant issues identified during automated screening.",
                "clinical_rationale": "Automated screening did not detect common drug interactions or concerns. Manual clinical review is still recommended.",
                "involved_medications": [],
                "suggested_text": "Medication regimen reviewed. No significant drug-related problems identified at this time."
            })

        return suggestions


ai_service = AIService()
