"""PDF generation service using WeasyPrint."""
import os
from typing import Optional
from datetime import datetime
from io import BytesIO
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML, CSS
from sqlalchemy.orm import Session
from app.models import Review, ReportDraft, Medication
from app.core.config import settings


class PDFService:
    """Service for generating PDF reports."""

    def __init__(self, db: Session):
        self.db = db
        # Set up Jinja2 template environment
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        os.makedirs(template_dir, exist_ok=True)
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )

    def generate_pdf(self, review: Review, draft: ReportDraft, is_draft: bool = True) -> bytes:
        """Generate PDF from report draft."""
        # Get medications for the review
        medications = self.db.query(Medication).filter(
            Medication.review_id == review.id,
            Medication.is_ceased == False
        ).all()

        # Prepare template context
        context = {
            'review': review,
            'draft': draft,
            'patient': review.patient,
            'gp': review.gp,
            'pharmacist': review.pharmacist,
            'medications': medications,
            'sections': draft.sections,
            'is_draft': is_draft,
            'generated_at': datetime.utcnow().strftime('%d/%m/%Y %H:%M'),
            'review_type_label': 'Home Medicines Review' if review.review_type.value == 'hmr' else 'Residential Medication Management Review',
        }

        # Render HTML
        html_content = self._render_template(context)

        # Generate PDF
        html = HTML(string=html_content)
        css = CSS(string=self._get_stylesheet(is_draft))

        pdf_bytes = html.write_pdf(stylesheets=[css])
        return pdf_bytes

    def _render_template(self, context: dict) -> str:
        """Render HTML template with context."""
        # Using inline template for simplicity
        template_str = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ review_type_label }} Report</title>
</head>
<body>
    <div class="header">
        <h1>{{ review_type_label }}</h1>
        <p class="subtitle">Medication Review Report</p>
    </div>

    {% if is_draft %}
    <div class="draft-watermark">DRAFT</div>
    {% endif %}

    <section class="section">
        <h2>Patient Details</h2>
        <div class="content">{{ sections.patient_details.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Reason for Review</h2>
        <div class="content">{{ sections.reason_for_review.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Current Medications</h2>
        <table class="medication-table">
            <thead>
                <tr>
                    <th>Drug</th>
                    <th>Strength</th>
                    <th>Dose/Frequency</th>
                    <th>Route</th>
                    <th>Indication</th>
                </tr>
            </thead>
            <tbody>
                {% for med in medications %}
                <tr>
                    <td>{{ med.drug_name }}</td>
                    <td>{{ med.strength or '-' }}</td>
                    <td>{{ med.dose or med.frequency or '-' }}</td>
                    <td>{{ med.route }}</td>
                    <td>{{ med.indication or '-' }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </section>

    <section class="section">
        <h2>Summary of Findings</h2>
        <div class="content">{{ sections.summary_of_findings.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Medication Recommendations</h2>
        <div class="content">{{ sections.medication_recommendations.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Deprescribing Considerations</h2>
        <div class="content">{{ sections.deprescribing.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Monitoring & Follow-up</h2>
        <div class="content">{{ sections.monitoring_followup.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    <section class="section">
        <h2>Patient Education</h2>
        <div class="content">{{ sections.patient_education.content | replace('**', '<strong>') | replace('**', '</strong>') | safe }}</div>
    </section>

    {% if sections.pharmacist_signoff.content %}
    <section class="section signoff">
        <h2>Pharmacist Sign-off</h2>
        <div class="content">{{ sections.pharmacist_signoff.content }}</div>
    </section>
    {% endif %}

    <div class="footer">
        <p>Report generated: {{ generated_at }}</p>
        <p>Pharmacist: {{ pharmacist.full_name }}</p>
        {% if pharmacist.ahpra_number %}
        <p>AHPRA: {{ pharmacist.ahpra_number }}</p>
        {% endif %}
    </div>
</body>
</html>
'''
        template = self.env.from_string(template_str)
        return template.render(**context)

    def _get_stylesheet(self, is_draft: bool) -> str:
        """Get CSS stylesheet for PDF."""
        draft_watermark = '''
            .draft-watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                font-weight: bold;
                color: rgba(200, 200, 200, 0.3);
                z-index: -1;
                pointer-events: none;
            }
        ''' if is_draft else ''

        return f'''
            @page {{
                size: A4;
                margin: 2cm;
                @top-right {{
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10px;
                    color: #666;
                }}
            }}

            body {{
                font-family: 'Helvetica', 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #333;
            }}

            {draft_watermark}

            .header {{
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
            }}

            .header h1 {{
                font-size: 24pt;
                color: #1e40af;
                margin: 0 0 10px 0;
            }}

            .header .subtitle {{
                font-size: 14pt;
                color: #666;
                margin: 0;
            }}

            .section {{
                margin-bottom: 25px;
                page-break-inside: avoid;
            }}

            .section h2 {{
                font-size: 14pt;
                color: #1e40af;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }}

            .section .content {{
                white-space: pre-wrap;
            }}

            .medication-table {{
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 10pt;
            }}

            .medication-table th,
            .medication-table td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}

            .medication-table th {{
                background-color: #f3f4f6;
                font-weight: bold;
                color: #374151;
            }}

            .medication-table tr:nth-child(even) {{
                background-color: #f9fafb;
            }}

            .signoff {{
                border: 2px solid #1e40af;
                padding: 20px;
                margin-top: 30px;
                background-color: #f8fafc;
            }}

            .footer {{
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 10pt;
                color: #666;
            }}

            .footer p {{
                margin: 5px 0;
            }}

            strong {{
                font-weight: bold;
            }}
        '''

    def save_pdf(self, pdf_bytes: bytes, review_id: str, is_final: bool = False) -> str:
        """Save PDF to filesystem and return path."""
        # Create output directory
        output_dir = os.path.join(settings.UPLOAD_DIR, 'reports')
        os.makedirs(output_dir, exist_ok=True)

        # Generate filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        suffix = 'final' if is_final else 'draft'
        filename = f"report_{review_id}_{suffix}_{timestamp}.pdf"
        filepath = os.path.join(output_dir, filename)

        # Write file
        with open(filepath, 'wb') as f:
            f.write(pdf_bytes)

        return filepath
