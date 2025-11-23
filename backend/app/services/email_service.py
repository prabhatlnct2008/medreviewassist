"""Email service for sending reports via SMTP."""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional
from datetime import datetime
from jinja2 import Environment, BaseLoader

from app.core.config import settings
from app.models import Review, GP, Patient, User


class EmailService:
    """Service for sending email reports."""

    def __init__(self):
        self.smtp_server = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or "noreply@medreviewassist.com"
        self.env = Environment(loader=BaseLoader())

    def send_report(
        self,
        review: Review,
        pdf_path: str,
        recipient_email: Optional[str] = None,
    ) -> dict:
        """Send report email to GP with PDF attachment."""
        patient = review.patient
        gp = review.gp
        pharmacist = review.pharmacist

        # Use GP email or provided recipient
        to_email = recipient_email or gp.email

        if not to_email:
            return {
                "success": False,
                "error": "No recipient email address available",
            }

        # Generate email content
        subject = f"Medication Review Report - {patient.full_name}"
        html_body = self._generate_email_body(review, patient, gp, pharmacist)

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject

            # Attach HTML body
            msg.attach(MIMEText(html_body, 'html'))

            # Attach PDF
            if pdf_path and os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as f:
                    pdf_attachment = MIMEApplication(f.read(), _subtype='pdf')
                    pdf_filename = f"MedReview_{patient.full_name.replace(' ', '_')}_{review.review_type.value.upper()}.pdf"
                    pdf_attachment.add_header(
                        'Content-Disposition', 'attachment',
                        filename=pdf_filename
                    )
                    msg.attach(pdf_attachment)

            # Send email
            if self.smtp_server and self.smtp_username:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)

                return {
                    "success": True,
                    "recipient": to_email,
                    "sent_at": datetime.utcnow().isoformat(),
                }
            else:
                # Mock mode - just log
                return {
                    "success": True,
                    "recipient": to_email,
                    "sent_at": datetime.utcnow().isoformat(),
                    "mock": True,
                    "message": "SMTP not configured - email would be sent to " + to_email,
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }

    def _generate_email_body(
        self,
        review: Review,
        patient: Patient,
        gp: GP,
        pharmacist: User,
    ) -> str:
        """Generate HTML email body."""
        template_str = '''
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Medication Review Report</h1>
        </div>

        <div class="content">
            <p>Dear Dr {{ gp_name }},</p>

            <p>Please find attached the {{ review_type }} report for your patient <strong>{{ patient_name }}</strong>.</p>

            <div class="highlight">
                <p><strong>Patient:</strong> {{ patient_name }}</p>
                {% if patient_dob %}
                <p><strong>Date of Birth:</strong> {{ patient_dob }}</p>
                {% endif %}
                <p><strong>Review Type:</strong> {{ review_type }}</p>
                <p><strong>Review Date:</strong> {{ review_date }}</p>
            </div>

            <p>This report contains a comprehensive medication review including:</p>
            <ul>
                <li>Current medication assessment</li>
                <li>Identified drug-related issues</li>
                <li>Clinical recommendations</li>
                <li>Monitoring and follow-up plan</li>
            </ul>

            <p>Please review the attached PDF document for full details. Should you require any clarification or wish to discuss the recommendations, please don't hesitate to contact me.</p>

            <p>Kind regards,</p>
            <p><strong>{{ pharmacist_name }}</strong><br>
            {% if pharmacist_ahpra %}AHPRA: {{ pharmacist_ahpra }}<br>{% endif %}
            Accredited Pharmacist</p>
        </div>

        <div class="footer">
            <p>This email and attachment contains confidential patient information. If you have received this in error, please delete it immediately and notify the sender.</p>
            <p>Generated by MedReview Assist</p>
        </div>
    </div>
</body>
</html>
'''
        template = self.env.from_string(template_str)

        review_type_label = 'Home Medicines Review (HMR)' if review.review_type.value == 'hmr' else 'Residential Medication Management Review (RMMR)'

        return template.render(
            gp_name=gp.name,
            patient_name=patient.full_name,
            patient_dob=patient.date_of_birth.strftime('%d/%m/%Y') if patient.date_of_birth else None,
            review_type=review_type_label,
            review_date=datetime.utcnow().strftime('%d/%m/%Y'),
            pharmacist_name=pharmacist.full_name,
            pharmacist_ahpra=pharmacist.ahpra_number,
        )
