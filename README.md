# MedReview Assist

An AI-assisted Clinical Decision Support System for Australian pharmacists to create Home Medicines Reviews (HMR) and Residential Medication Management Reviews (RMMR).

## Overview

MedReview Assist streamlines the medication review process by providing:

- **Patient & GP Management** - Track patients and their referring GPs
- **Smart Medication Input** - Manual entry, bulk paste, OCR scanning, or voice dictation
- **Clinical Notes** - Structured sections for medical history, allergies, adherence, and patient goals
- **AI-Powered Suggestions** - Clinical decision support for drug interactions, dosing, and deprescribing
- **Report Generation** - Professional PDF reports with customizable templates
- **Email Delivery** - Send finalized reports directly to GPs
- **Audit Trail** - Complete history of all review actions for compliance

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with SQLite (default) or PostgreSQL
- **Pydantic** - Data validation
- **OpenAI GPT-4** - AI suggestions and transcription
- **WeasyPrint** - PDF generation
- **pytesseract** - OCR for medication images

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management

## Project Structure

```
medreviewassist/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   ├── core/                # Config, database, security
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── alembic/                 # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── components/          # Reusable UI components
│   │   ├── features/            # Feature modules
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand stores
│   │   └── types/               # TypeScript types
│   └── package.json
└── phases.md                    # Development progress
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Clone & Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p uploads reports

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health

## Configuration

Create `backend/.env` for custom configuration:

```env
# Security (REQUIRED for production)
SECRET_KEY=your-secure-random-string-here

# Database (default: SQLite)
DATABASE_URL=sqlite:///./medreview.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost/medreview

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4

# Email (for sending reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# CORS (adjust for production)
CORS_ORIGINS=["http://localhost:5173"]
```

## Features Guide

### Creating a Review

1. **Dashboard** → Click "New Review"
2. **Patient Step** → Search existing or create new patient
3. **Context Step** → Select GP, review type (HMR/RMMR), reason for referral
4. **Review Workspace** → Complete all tabs

### Medication Input Methods

| Method | Description |
|--------|-------------|
| **Manual** | Add medications one at a time with full details |
| **Bulk Paste** | Paste a list from another source (one per line) |
| **Scan Image** | Upload a photo of a medication list for OCR |
| **Dictate** | Speak medications and have them transcribed |

### Clinical Notes Sections

- Presenting Issues
- Medical History
- Allergies & Adverse Reactions
- Medication Adherence
- Patient Goals & Concerns

### AI Suggestions

The AI analyzes medications and clinical notes to suggest:
- Drug interactions
- Dosing adjustments
- Deprescribing opportunities
- Monitoring requirements

### Report Workflow

1. **Generate Draft** → AI creates initial report sections
2. **Edit Sections** → Review and customize each section
3. **Mark Reviewed** → Confirm each section is accurate
4. **Finalize** → Complete checklist and add signature
5. **Send** → Email PDF to referring GP

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Get tokens
- `POST /api/v1/auth/refresh` - Refresh access token

### Reviews
- `GET /api/v1/reviews` - List reviews (with filters)
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/{id}` - Get review details
- `PUT /api/v1/reviews/{id}` - Update review

### Medications
- `GET /api/v1/reviews/{id}/medications` - List medications
- `POST /api/v1/reviews/{id}/medications` - Add medication
- `POST /api/v1/reviews/{id}/medications/bulk` - Bulk add
- `POST /api/v1/reviews/{id}/medications/ocr` - OCR upload
- `POST /api/v1/reviews/{id}/medications/dictate` - Audio transcription

### Reports
- `POST /api/v1/reviews/{id}/report/generate` - Generate draft
- `GET /api/v1/reviews/{id}/report/preview` - PDF preview
- `POST /api/v1/reviews/{id}/report/finalize` - Finalize report
- `POST /api/v1/reviews/{id}/report/send` - Email to GP

### Settings
- `GET /api/v1/settings` - Get user settings
- `PUT /api/v1/settings/profile` - Update profile
- `GET /api/v1/settings/templates/{type}` - Get report template
- `PUT /api/v1/settings/templates/{type}` - Update template

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Output in frontend/dist/
```

## Deployment

### Docker (Recommended)

```dockerfile
# Backend Dockerfile example
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up HTTPS/TLS
- [ ] Configure CORS for your domain
- [ ] Set up email credentials
- [ ] Add OpenAI API key (if using AI features)
- [ ] Install Tesseract OCR (if using image scanning)

## Australian Healthcare Context

This application is designed for Australian pharmacists conducting:

- **HMR (Home Medicines Review)** - PBS-funded reviews for patients at home
- **RMMR (Residential Medication Management Review)** - Reviews for aged care facility residents

### Compliance Features

- AHPRA registration number validation
- Consent tracking and documentation
- Complete audit trail of all actions
- Professional report formatting per PBS requirements

## License

Proprietary - All rights reserved

## Support

For issues or feature requests, please contact the development team.

---

*Built for Australian pharmacists by pharmacists*
