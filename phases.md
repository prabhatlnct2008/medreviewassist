# Project Status: MedReview Assist

## Current Phase: Phase 1 - Foundation

---

## Phase 1: Foundation & Backend Scaffolding
**Goal:** Set up project structure, database, and authentication

### Backend Setup
- [ ] Initialize FastAPI project with modular structure
- [ ] Configure SQLite database with SQLAlchemy
- [ ] Set up Alembic for database migrations
- [ ] Create base models and mixins (timestamps, UUID)
- [ ] Configure CORS, middleware, and error handling

### Database Models
- [ ] Implement User model with role enum
- [ ] Implement Patient model
- [ ] Implement GP model
- [ ] Implement Review model with status enum
- [ ] Implement Medication model
- [ ] Implement ClinicalNote model with section types
- [ ] Implement AISuggestion model
- [ ] Implement ReportDraft model
- [ ] Implement Consent model
- [ ] Implement AuditLog model
- [ ] Create initial Alembic migration

### Authentication
- [ ] Implement password hashing (bcrypt)
- [ ] Create JWT token generation/validation
- [ ] Implement signup endpoint with validation
- [ ] Implement login endpoint
- [ ] Implement token refresh endpoint
- [ ] Implement logout endpoint
- [ ] Create auth dependency (`get_current_user`)
- [ ] Create role-based guards

### Frontend Setup
- [ ] Initialize React + TypeScript + Vite project
- [ ] Configure Tailwind CSS
- [ ] Set up project folder structure (feature-first)
- [ ] Configure React Router
- [ ] Create Axios client with interceptors
- [ ] Set up Zustand auth store
- [ ] Create base UI components (Button, Input, Card)

---

## Phase 2: User Flows (Auth & Onboarding)
**Goal:** Complete signup, login, and onboarding wizard

### Backend
- [ ] GET `/auth/me` endpoint
- [ ] PUT `/users/me` endpoint for profile updates
- [ ] POST `/users/me/onboarding` endpoint

### Frontend - Landing & Auth
- [ ] Create Landing page (marketing)
- [ ] Create Login page with form validation
- [ ] Create Signup page with password strength indicator
- [ ] Implement auth flow (token storage, redirects)
- [ ] Create ProtectedRoute component

### Frontend - Onboarding
- [ ] Create OnboardingPage with multi-step wizard
- [ ] Step 1: Professional details form
- [ ] Step 2: Organisation context (optional)
- [ ] Step 3: Compliance acknowledgment
- [ ] Step 4: Quick tour / welcome
- [ ] Redirect to Dashboard on completion

---

## Phase 3: Dashboard & Patient Management
**Goal:** Build the main dashboard and patient CRUD

### Backend - Patients API
- [ ] GET `/patients` with search and pagination
- [ ] POST `/patients` create endpoint
- [ ] GET `/patients/{id}` detail endpoint
- [ ] PUT `/patients/{id}` update endpoint
- [ ] GET `/patients/{id}/reviews` patient's reviews

### Backend - GP API
- [ ] GET `/gps` with search
- [ ] POST `/gps` create endpoint
- [ ] GET `/gps/{id}` detail endpoint

### Frontend - Dashboard
- [ ] Create DashboardPage layout
- [ ] Create Navbar component with user menu
- [ ] Create ReviewsTable component
- [ ] Create ReviewFilters component (type, status)
- [ ] Create SearchBar component
- [ ] Implement "New Review" button navigation
- [ ] Create StatusBadge component

### Frontend - Patients
- [ ] Create PatientsPage with list
- [ ] Create PatientSearch component
- [ ] Create PatientForm (create/edit)
- [ ] Create PatientProfilePage
- [ ] Create patient reviews history view

---

## Phase 4: Review Wizard & Basic Review Management
**Goal:** Create new review flow (wizard) and review CRUD

### Backend - Reviews API
- [ ] GET `/reviews` with filters and pagination
- [ ] POST `/reviews` create endpoint
- [ ] GET `/reviews/{id}` full detail endpoint
- [ ] PUT `/reviews/{id}` update endpoint
- [ ] DELETE `/reviews/{id}` (drafts only)

### Frontend - New Review Wizard
- [ ] Create NewReviewPage with wizard layout
- [ ] Create WizardProgress component
- [ ] Step 1: PatientStep (search or create patient)
- [ ] Step 2: ReviewContextStep (type, GP, reason, date)
- [ ] Navigation to Review Workspace on completion

### Frontend - Review Workspace Shell
- [ ] Create ReviewWorkspacePage layout
- [ ] Create WorkspaceTabs component
- [ ] Implement tab navigation state
- [ ] Create autosave indicator

---

## Phase 5: Medications Input
**Goal:** Build medication management with multiple input methods

### Backend - Medications API
- [ ] GET `/reviews/{id}/medications` list
- [ ] POST `/reviews/{id}/medications` create single
- [ ] POST `/reviews/{id}/medications/bulk` create multiple
- [ ] PUT `/reviews/{id}/medications/{med_id}` update
- [ ] DELETE `/reviews/{id}/medications/{med_id}` delete
- [ ] POST `/reviews/{id}/medications/parse` text parsing (OpenAI)

### Frontend - Medications Tab
- [ ] Create MedicationsTab layout (two-column)
- [ ] Create MedicationTable component
- [ ] Create MedicationForm (modal/inline)
- [ ] Implement inline editing
- [ ] Implement "Mark as ceased" toggle
- [ ] Create BulkPastePanel component
- [ ] Implement medication parsing preview
- [ ] Accept/Edit/Remove parsed medications

---

## Phase 6: OCR & Dictation Input
**Goal:** Add advanced input methods for medications

### Backend
- [ ] POST `/reviews/{id}/medications/ocr` OCR endpoint
- [ ] Integrate pytesseract for image text extraction
- [ ] POST `/reviews/{id}/medications/dictate` endpoint
- [ ] Integrate OpenAI Whisper for transcription

### Frontend
- [ ] Create OCRUpload component (file upload)
- [ ] Show OCR processing state
- [ ] Display parsed results for review
- [ ] Create DictationButton component
- [ ] Implement Web Audio API recording
- [ ] Show transcription and parsing results

---

## Phase 7: Clinical Notes
**Goal:** Build symptoms & history input tab

### Backend - Clinical Notes API
- [ ] GET `/reviews/{id}/notes` all sections
- [ ] PUT `/reviews/{id}/notes/{section}` update section

### Frontend - Symptoms Tab
- [ ] Create SymptomsTab layout
- [ ] Create section text areas:
  - [ ] Presenting issues
  - [ ] Past medical history
  - [ ] Allergies & adverse reactions
  - [ ] Adherence & lifestyle
  - [ ] Patient goals & concerns
- [ ] Implement "Mark as key point" toggle
- [ ] Implement autosave with debounce

---

## Phase 8: AI Suggestions (Decision Support)
**Goal:** Generate and display AI-powered clinical suggestions

### Backend - AI Integration
- [ ] Create OpenAI service client
- [ ] Design clinical analysis prompt template
- [ ] POST `/reviews/{id}/ai/generate` endpoint
- [ ] Parse OpenAI response into AISuggestion objects
- [ ] GET `/reviews/{id}/ai/suggestions` list
- [ ] PUT `/reviews/{id}/ai/suggestions/{id}` update

### Frontend - AI Summary Tab
- [ ] Create AISummaryTab layout (two-panel)
- [ ] Create disclaimer banner
- [ ] Create IssuesList component with severity badges
- [ ] Create IssueDetail component
- [ ] Display involved medications
- [ ] Display clinical rationale
- [ ] Display evidence summary
- [ ] Show suggested report text
- [ ] "Include in draft" checkbox
- [ ] "Insert into report" button

---

## Phase 9: Report Drafting
**Goal:** Build report generation and editing

### Backend - Report API
- [ ] POST `/reviews/{id}/report/generate` draft generation
- [ ] Implement Jinja2 report template
- [ ] GET `/reviews/{id}/report` get current draft
- [ ] PUT `/reviews/{id}/report` update sections

### Frontend - Report Draft Tab
- [ ] Create ReportDraftTab layout (three-column)
- [ ] Create SectionNav component with review status
- [ ] Create ReportEditor with rich text (TipTap)
- [ ] Create SuggestionsSidebar component
- [ ] "Generate initial draft" button
- [ ] Section insertion from suggestions
- [ ] Patient summary snapshot in sidebar

---

## Phase 10: PDF Preview & Export
**Goal:** Generate and preview PDF reports

### Backend - PDF Generation
- [ ] Create WeasyPrint PDF service
- [ ] Design PDF template (HTML/CSS)
- [ ] GET `/reviews/{id}/report/preview` PDF endpoint
- [ ] Add DRAFT watermark for non-finalized
- [ ] Store finalized PDF path

### Frontend
- [ ] "Preview PDF" button implementation
- [ ] PDF viewer modal or new tab
- [ ] Download PDF button

---

## Phase 11: Finalization & Consent
**Goal:** Complete review finalization flow with compliance

### Backend
- [ ] GET/PUT `/reviews/{id}/consent` endpoints
- [ ] POST `/reviews/{id}/report/finalize` endpoint
- [ ] Lock review after finalization
- [ ] Store immutable PDF snapshot
- [ ] Update review status to SUBMITTED

### Frontend
- [ ] Create ConsentPanel component
- [ ] Create FinalizeModal with checklist
- [ ] Signature block display
- [ ] Delivery method selection
- [ ] Confirmation checkbox
- [ ] Post-finalization: lock editing

---

## Phase 12: Email Delivery
**Goal:** Send finalized reports to GPs via email

### Backend - Email Service
- [ ] Configure SMTP settings
- [ ] Create email template (Jinja2)
- [ ] POST `/reviews/{id}/report/send` endpoint
- [ ] Attach PDF to email

### Frontend
- [ ] Email delivery option in FinalizeModal
- [ ] Send confirmation feedback
- [ ] Email status indicator

---

## Phase 13: Audit Trail & Compliance
**Goal:** Implement comprehensive audit logging

### Backend
- [ ] Create SQLAlchemy event listeners for audit
- [ ] GET `/reviews/{id}/audit` endpoint
- [ ] Log all significant actions automatically

### Frontend
- [ ] Create ReviewHistory component (timeline view)
- [ ] Display audit events with timestamps
- [ ] Link from Review Workspace

---

## Phase 14: Reopen & Amendment
**Goal:** Allow reopening finalized reports with audit

### Backend
- [ ] POST `/reviews/{id}/report/reopen` endpoint
- [ ] Require reason for reopening
- [ ] Log amendment in audit trail
- [ ] Update review status appropriately

### Frontend
- [ ] "Reopen for amendment" button (on finalized reviews)
- [ ] Reason input modal
- [ ] Show amendment history

---

## Phase 15: Settings & Templates
**Goal:** User settings and report template management

### Backend
- [ ] GET/PUT `/settings/templates` endpoints
- [ ] Store default HMR/RMMR templates

### Frontend
- [ ] Create SettingsPage with tabs
- [ ] Profile settings form
- [ ] Template editor (HMR, RMMR)
- [ ] Reset to defaults option

---

## Phase 16: Polish & QA
**Goal:** Final refinements and quality assurance

### UI/UX Improvements
- [ ] Loading states and skeletons
- [ ] Error handling and toast notifications
- [ ] Empty states for lists
- [ ] Responsive design review
- [ ] Accessibility audit (ARIA labels, keyboard nav)

### Testing
- [ ] Backend unit tests (pytest)
- [ ] API integration tests
- [ ] Frontend component tests
- [ ] E2E tests (Playwright)

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide / help section
- [ ] Deployment documentation

---

## Future Phases (Post-MVP)

### Phase 17: Multi-Tenancy / Organisation
- [ ] Organisation model and management
- [ ] Multi-user per organisation
- [ ] Organisation branding (logo, signature)
- [ ] User invitation system

### Phase 18: Advanced Features
- [ ] Drug database integration (PBS/TGA API)
- [ ] Real-time collaboration
- [ ] Mobile-responsive improvements
- [ ] Offline mode (PWA)
- [ ] Bulk import/export

---

## Progress Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ⏳ Not Started | Foundation & Backend Scaffolding |
| Phase 2 | ⏳ Not Started | User Flows (Auth & Onboarding) |
| Phase 3 | ⏳ Not Started | Dashboard & Patient Management |
| Phase 4 | ⏳ Not Started | Review Wizard & Basic Review Management |
| Phase 5 | ⏳ Not Started | Medications Input |
| Phase 6 | ⏳ Not Started | OCR & Dictation Input |
| Phase 7 | ⏳ Not Started | Clinical Notes |
| Phase 8 | ⏳ Not Started | AI Suggestions (Decision Support) |
| Phase 9 | ⏳ Not Started | Report Drafting |
| Phase 10 | ⏳ Not Started | PDF Preview & Export |
| Phase 11 | ⏳ Not Started | Finalization & Consent |
| Phase 12 | ⏳ Not Started | Email Delivery |
| Phase 13 | ⏳ Not Started | Audit Trail & Compliance |
| Phase 14 | ⏳ Not Started | Reopen & Amendment |
| Phase 15 | ⏳ Not Started | Settings & Templates |
| Phase 16 | ⏳ Not Started | Polish & QA |

---

*Last Updated: 2025-11-23*
