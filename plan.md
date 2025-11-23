# Implementation Plan: MedReview Assist

## 1. System Overview

MedReview Assist is a web-based AI-assisted Clinical Decision Support & Documentation system for Australian accredited pharmacists. The system streamlines the creation of Home Medicines Review (HMR) and Residential Medication Management Review (RMMR) reports.

### Core Value Proposition
"Cut your HMR/RMMR report time in half while staying compliant and in full clinical control."

### Technology Stack
| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python 3.11+) |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Authentication | JWT with refresh tokens |
| AI Integration | OpenAI API (GPT-4) |
| PDF Generation | WeasyPrint |
| Email | SMTP |
| OCR | Tesseract (pytesseract) |
| Speech-to-Text | OpenAI Whisper API |

---

## 2. Architecture Specification

### 2.1 Database Models (SQLAlchemy)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User (1) ──────< Review (Many)
Patient (1) ───< Review (Many)
GP (1) ────────< Review (Many)
Review (1) ────< Medication (Many)
Review (1) ────< ClinicalNote (Many)
Review (1) ────< AISuggestion (Many)
Review (1) ────< AuditLog (Many)
Review (1) ────○ Consent (1)
Review (1) ────○ ReportDraft (1)
```

#### **User**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `email` | String(255) | Unique, Not Null, Index |
| `password_hash` | String(255) | Not Null |
| `first_name` | String(100) | Not Null |
| `last_name` | String(100) | Not Null |
| `role` | Enum(ADMIN, PHARMACIST) | Default: PHARMACIST |
| `ahpra_number` | String(50) | Nullable |
| `organisation_name` | String(255) | Nullable |
| `conducts_hmr` | Boolean | Default: True |
| `conducts_rmmr` | Boolean | Default: True |
| `onboarding_completed` | Boolean | Default: False |
| `is_active` | Boolean | Default: True |
| `created_at` | DateTime | Not Null |
| `updated_at` | DateTime | Not Null |

#### **Patient**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `full_name` | String(255) | Not Null, Index |
| `date_of_birth` | Date | Not Null |
| `sex` | Enum(MALE, FEMALE, OTHER) | Not Null |
| `address` | Text | Nullable |
| `medicare_number` | String(20) | Nullable |
| `residential_setting` | Enum(HOME, RACF, OTHER) | Default: HOME |
| `created_by_id` | UUID | FK → User.id |
| `created_at` | DateTime | Not Null |
| `updated_at` | DateTime | Not Null |

#### **GP**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | String(255) | Not Null |
| `practice_name` | String(255) | Nullable |
| `email` | String(255) | Nullable |
| `fax` | String(50) | Nullable |
| `created_by_id` | UUID | FK → User.id |
| `created_at` | DateTime | Not Null |

#### **Review**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `patient_id` | UUID | FK → Patient.id, Not Null |
| `pharmacist_id` | UUID | FK → User.id, Not Null |
| `gp_id` | UUID | FK → GP.id, Not Null |
| `review_type` | Enum(HMR, RMMR) | Not Null |
| `status` | Enum(DRAFT, AWAITING_GP, SUBMITTED, ARCHIVED) | Default: DRAFT |
| `reason_for_referral` | Text | Nullable |
| `interview_date` | Date | Nullable |
| `finalized_at` | DateTime | Nullable |
| `created_at` | DateTime | Not Null |
| `updated_at` | DateTime | Not Null |

#### **Medication**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Not Null, Index |
| `drug_name` | String(255) | Not Null |
| `strength` | String(100) | Nullable |
| `form` | String(100) | Nullable |
| `dose` | String(100) | Nullable |
| `frequency` | String(100) | Nullable |
| `route` | String(50) | Default: 'oral' |
| `indication` | String(255) | Nullable |
| `start_date` | Date | Nullable |
| `prescriber` | String(255) | Nullable |
| `comments` | Text | Nullable |
| `is_ceased` | Boolean | Default: False |
| `order_index` | Integer | Default: 0 |
| `created_at` | DateTime | Not Null |

#### **ClinicalNote**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Not Null, Index |
| `section_type` | Enum(PRESENTING_ISSUES, MEDICAL_HISTORY, ALLERGIES, ADHERENCE_LIFESTYLE, PATIENT_GOALS) | Not Null |
| `content` | Text | Nullable |
| `is_key_point` | Boolean | Default: False |
| `updated_at` | DateTime | Not Null |

#### **AISuggestion**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Not Null, Index |
| `severity` | Enum(INFO, MODERATE, HIGH) | Not Null |
| `title` | String(255) | Not Null |
| `category` | Enum(INTERACTION, DOSING, DEPRESCRIBING, ADHERENCE, MONITORING, OTHER) | Not Null |
| `description` | Text | Not Null |
| `involved_medications` | JSON | Nullable |
| `clinical_rationale` | Text | Nullable |
| `evidence_summary` | Text | Nullable |
| `suggested_text` | Text | Nullable |
| `is_included_in_report` | Boolean | Default: False |
| `is_dismissed` | Boolean | Default: False |
| `created_at` | DateTime | Not Null |

#### **ReportDraft**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Unique, Not Null |
| `sections` | JSON | Not Null |
| `generated_at` | DateTime | Nullable |
| `last_edited_at` | DateTime | Nullable |
| `pdf_path` | String(500) | Nullable |
| `is_finalized` | Boolean | Default: False |

**Report Sections JSON Structure:**
```json
{
  "patient_details": { "content": "...", "reviewed": false },
  "reason_for_review": { "content": "...", "reviewed": false },
  "summary_of_findings": { "content": "...", "reviewed": false },
  "medication_recommendations": { "content": "...", "reviewed": false },
  "deprescribing": { "content": "...", "reviewed": false },
  "monitoring_followup": { "content": "...", "reviewed": false },
  "patient_education": { "content": "...", "reviewed": false },
  "pharmacist_signoff": { "content": "...", "reviewed": false }
}
```

#### **Consent**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Unique, Not Null |
| `obtained` | Boolean | Default: False |
| `obtained_at` | DateTime | Nullable |
| `notes` | Text | Nullable |

#### **AuditLog**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `review_id` | UUID | FK → Review.id, Not Null, Index |
| `user_id` | UUID | FK → User.id, Not Null |
| `action` | Enum(CREATED, UPDATED, MEDICATIONS_ADDED, AI_GENERATED, DRAFT_GENERATED, EDITED, FINALIZED, REOPENED, EXPORTED) | Not Null |
| `details` | JSON | Nullable |
| `created_at` | DateTime | Not Null |

---

### 2.2 API Contract (FastAPI)

Base URL: `/api/v1`

#### Authentication Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| POST | `/auth/signup` | `UserCreate` | `UserResponse` | Register new pharmacist |
| POST | `/auth/login` | `LoginRequest` | `TokenResponse` | Login and get JWT tokens |
| POST | `/auth/refresh` | `RefreshRequest` | `TokenResponse` | Refresh access token |
| POST | `/auth/logout` | - | `MessageResponse` | Invalidate refresh token |
| GET | `/auth/me` | - | `UserResponse` | Get current user |

#### User/Onboarding Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| PUT | `/users/me` | `UserUpdate` | `UserResponse` | Update profile |
| POST | `/users/me/onboarding` | `OnboardingData` | `UserResponse` | Complete onboarding |

#### Patient Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/patients` | Query params | `PaginatedPatients` | List patients with search |
| POST | `/patients` | `PatientCreate` | `PatientResponse` | Create new patient |
| GET | `/patients/{id}` | - | `PatientResponse` | Get patient by ID |
| PUT | `/patients/{id}` | `PatientUpdate` | `PatientResponse` | Update patient |
| GET | `/patients/{id}/reviews` | - | `List[ReviewSummary]` | Get patient's reviews |

#### GP Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/gps` | Query params | `List[GPResponse]` | List/search GPs |
| POST | `/gps` | `GPCreate` | `GPResponse` | Create new GP |
| GET | `/gps/{id}` | - | `GPResponse` | Get GP by ID |

#### Review Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/reviews` | Query params | `PaginatedReviews` | List reviews with filters |
| POST | `/reviews` | `ReviewCreate` | `ReviewResponse` | Create new review |
| GET | `/reviews/{id}` | - | `ReviewDetailResponse` | Get full review details |
| PUT | `/reviews/{id}` | `ReviewUpdate` | `ReviewResponse` | Update review metadata |
| DELETE | `/reviews/{id}` | - | `MessageResponse` | Delete draft review |

#### Medication Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/reviews/{id}/medications` | - | `List[MedicationResponse]` | Get review medications |
| POST | `/reviews/{id}/medications` | `MedicationCreate` | `MedicationResponse` | Add medication |
| POST | `/reviews/{id}/medications/bulk` | `BulkMedicationCreate` | `List[MedicationResponse]` | Add multiple medications |
| POST | `/reviews/{id}/medications/parse` | `ParseMedicationRequest` | `List[ParsedMedication]` | Parse text to medications |
| POST | `/reviews/{id}/medications/ocr` | `File upload` | `List[ParsedMedication]` | OCR image to medications |
| PUT | `/reviews/{id}/medications/{med_id}` | `MedicationUpdate` | `MedicationResponse` | Update medication |
| DELETE | `/reviews/{id}/medications/{med_id}` | - | `MessageResponse` | Delete medication |

#### Clinical Notes Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/reviews/{id}/notes` | - | `List[ClinicalNoteResponse]` | Get all clinical notes |
| PUT | `/reviews/{id}/notes/{section}` | `ClinicalNoteUpdate` | `ClinicalNoteResponse` | Update note section |

#### AI Suggestions Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| POST | `/reviews/{id}/ai/generate` | - | `List[AISuggestionResponse]` | Generate AI suggestions |
| GET | `/reviews/{id}/ai/suggestions` | - | `List[AISuggestionResponse]` | Get existing suggestions |
| PUT | `/reviews/{id}/ai/suggestions/{sug_id}` | `AISuggestionUpdate` | `AISuggestionResponse` | Update suggestion (include/dismiss) |

#### Report Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| POST | `/reviews/{id}/report/generate` | - | `ReportDraftResponse` | Generate report draft |
| GET | `/reviews/{id}/report` | - | `ReportDraftResponse` | Get current draft |
| PUT | `/reviews/{id}/report` | `ReportDraftUpdate` | `ReportDraftResponse` | Update report sections |
| GET | `/reviews/{id}/report/preview` | - | `PDF file` | Preview PDF |
| POST | `/reviews/{id}/report/finalize` | `FinalizeRequest` | `ReviewResponse` | Finalize report |
| POST | `/reviews/{id}/report/send` | `SendReportRequest` | `MessageResponse` | Email to GP |
| POST | `/reviews/{id}/report/reopen` | `ReopenRequest` | `ReviewResponse` | Reopen for amendment |

#### Consent Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/reviews/{id}/consent` | - | `ConsentResponse` | Get consent status |
| PUT | `/reviews/{id}/consent` | `ConsentUpdate` | `ConsentResponse` | Update consent |

#### Audit Endpoints
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/reviews/{id}/audit` | - | `List[AuditLogResponse]` | Get audit trail |

#### Settings Endpoints (Admin)
| Method | Endpoint | Request Schema | Response Schema | Description |
|--------|----------|----------------|-----------------|-------------|
| GET | `/settings/templates` | - | `TemplatesResponse` | Get report templates |
| PUT | `/settings/templates` | `TemplatesUpdate` | `TemplatesResponse` | Update templates |

---

### 2.3 Frontend Modules

```
src/
├── api/                          # API client layer
│   ├── client.ts                 # Axios instance with interceptors
│   ├── auth.ts                   # Auth API calls
│   ├── patients.ts               # Patient API calls
│   ├── reviews.ts                # Review API calls
│   ├── medications.ts            # Medication API calls
│   └── reports.ts                # Report API calls
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   ├── useReviews.ts
│   ├── useMedications.ts
│   └── useAISuggestions.ts
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── PasswordStrength.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── OnboardingPage.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── ReviewsTable.tsx
│   │   │   ├── ReviewFilters.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   └── index.ts
│   │
│   ├── patients/
│   │   ├── components/
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   └── PatientSearch.tsx
│   │   ├── pages/
│   │   │   ├── PatientsPage.tsx
│   │   │   └── PatientProfilePage.tsx
│   │   └── index.ts
│   │
│   ├── reviews/
│   │   ├── components/
│   │   │   ├── wizard/
│   │   │   │   ├── PatientStep.tsx
│   │   │   │   ├── ReviewContextStep.tsx
│   │   │   │   └── WizardProgress.tsx
│   │   │   ├── workspace/
│   │   │   │   ├── WorkspaceTabs.tsx
│   │   │   │   ├── MedicationsTab.tsx
│   │   │   │   ├── MedicationTable.tsx
│   │   │   │   ├── MedicationForm.tsx
│   │   │   │   ├── BulkPastePanel.tsx
│   │   │   │   ├── OCRUpload.tsx
│   │   │   │   ├── SymptomsTab.tsx
│   │   │   │   ├── AISummaryTab.tsx
│   │   │   │   ├── IssuesList.tsx
│   │   │   │   ├── IssueDetail.tsx
│   │   │   │   ├── ReportDraftTab.tsx
│   │   │   │   ├── ReportEditor.tsx
│   │   │   │   ├── SectionNav.tsx
│   │   │   │   └── SuggestionsSidebar.tsx
│   │   │   ├── ConsentPanel.tsx
│   │   │   └── FinalizeModal.tsx
│   │   ├── pages/
│   │   │   ├── NewReviewPage.tsx
│   │   │   └── ReviewWorkspacePage.tsx
│   │   └── index.ts
│   │
│   └── settings/
│       ├── components/
│       │   ├── ProfileForm.tsx
│       │   ├── TemplateEditor.tsx
│       │   └── ComplianceSettings.tsx
│       ├── pages/
│       │   └── SettingsPage.tsx
│       └── index.ts
│
├── components/                   # Shared UI components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   └── common/
│       ├── ProtectedRoute.tsx
│       ├── ErrorBoundary.tsx
│       └── LoadingScreen.tsx
│
├── store/                        # State management (Zustand or Context)
│   ├── authStore.ts
│   └── reviewStore.ts
│
├── types/                        # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   └── enums.ts
│
├── utils/                        # Utility functions
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 3. Implementation Details

### 3.1 Authentication Flow
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Tokens stored in httpOnly cookies (access) and localStorage (refresh)
- FastAPI `Depends()` for route protection
- Role-based guards: `require_admin`, `require_pharmacist`

### 3.2 AI Integration (OpenAI)
- Model: GPT-4 for clinical analysis
- Structured prompts for medication review:
  - Drug-drug interactions
  - Dosing concerns (age, renal function indicators)
  - Deprescribing opportunities
  - Adherence/lifestyle factors
- Response parsed into structured `AISuggestion` objects
- Evidence references linked to TGA, PBS public resources

### 3.3 OCR Pipeline
- Frontend: File upload component (image/PDF)
- Backend: pytesseract for text extraction
- Post-processing: OpenAI to parse extracted text into structured medications

### 3.4 Speech-to-Text
- Frontend: Web Audio API for recording
- Backend: OpenAI Whisper API for transcription
- Post-processing: Same parsing pipeline as bulk paste

### 3.5 PDF Generation
- WeasyPrint for HTML → PDF conversion
- Jinja2 templates for report structure
- Stored in `media/reports/{review_id}/`
- Watermark: "DRAFT" until finalized

### 3.6 Email Integration
- SMTP via `smtplib` or `fastapi-mail`
- Template-based emails (Jinja2)
- PDF attachment for finalized reports

### 3.7 Audit Trail
- Automatic logging via SQLAlchemy event listeners
- Key events: create, update, generate, finalize, export

---

## 4. Security & Compliance Considerations

1. **Data Residency**: All data stored in Australian servers (deployment consideration)
2. **Encryption**: HTTPS enforced, passwords hashed with bcrypt
3. **PHI Handling**: Medicare numbers encrypted at rest
4. **Session Management**: JWT with short expiry, secure cookies
5. **Input Validation**: Pydantic schemas for all inputs
6. **Rate Limiting**: API rate limits on auth endpoints
7. **Audit Trail**: Immutable logs for compliance

---

## 5. Third-Party Libraries

### Backend
| Library | Purpose |
|---------|---------|
| FastAPI | Web framework |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| Pydantic | Data validation |
| python-jose | JWT handling |
| passlib[bcrypt] | Password hashing |
| openai | OpenAI API client |
| pytesseract | OCR |
| weasyprint | PDF generation |
| Jinja2 | Templating |
| python-multipart | File uploads |

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Router | Routing |
| Axios | HTTP client |
| React Query | Server state |
| Zustand | Client state |
| React Hook Form | Form handling |
| Zod | Schema validation |
| TipTap | Rich text editor |
| Lucide React | Icons |

---

*Last Updated: 2025-11-23*
