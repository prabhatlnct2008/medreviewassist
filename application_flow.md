AI-Assisted Clinical Decision Support & Documentation System

1. Product Overview

Working name: MedReview Assist (placeholder)

Core purpose:
A web-based, AI-assisted Clinical Decision Support & Documentation system for Australian accredited pharmacists to streamline creation of Home Medicines Review (HMR) and Residential Medication Management Review (RMMR) reports.

Primary persona:
	•	Accredited Consultant Pharmacist (Australia)
	•	Conducts HMRs/RMMRs
	•	Writes reports to GPs
	•	High administrative burden and time pressure

Secondary personas (future or indirect):
	•	GP (receives reports)
	•	Pharmacy / Organisation Manager (manages multiple pharmacists)
	•	Compliance Officer (audit & governance)

Core value proposition:

“Cut your HMR/RMMR report time in half while staying compliant and in full clinical control.”

⸻

2. High-Level User Flows
	1.	Pharmacist signup & onboarding
	2.	Pharmacist dashboard & case management
	3.	Create patient & new review (HMR/RMMR)
	4.	Input medication list & clinical notes (multi-mode input)
	5.	AI clinical suggestions & evidence (decision support)
	6.	Report drafting & editing (human-in-the-loop)
	7.	Export & share report with GP (PDF / email)
	8.	Patient & review history
	9.	Compliance flows (consent, disclaimers, audit trail)
	10.	Org/admin flows (optional multi-pharmacist usage)

Each flow below includes: screens, interactions, and a text wireframe.

⸻

3. Flow 1 – Pharmacist Signup & Onboarding

Screen 1.1 – Landing Page (Marketing)

Goal: Explain the product, reassure on compliance, and drive sign-ups.

Key sections:
	•	Hero section: value proposition and main CTA (“Start Free Trial” / “Sign up as Pharmacist”)
	•	Short “How it works” (3–4 steps from referral → report)
	•	Benefits section: “Save time”, “Evidence-based”, “Australian data only”, “You stay in control”
	•	Compliance & security reassurance: references to Australian Privacy Act, decision support only
	•	Footer with privacy policy, terms, contact

Primary CTA: “Sign up as Pharmacist”

⸻

Screen 1.2 – Sign Up

Fields:
	•	First name
	•	Last name
	•	Email
	•	Password (with strength indicator)
	•	Profession / Role dropdown (default: “Accredited Consultant Pharmacist”)
	•	AHPRA registration number (optional but recommended)
	•	Organisation / Practice name (optional)
	•	Checkboxes:
	•	“I agree to the Terms & Privacy Policy”
	•	“I understand this is clinical decision support software and I remain responsible for final clinical decisions.”

Interactions & behaviours:
	•	Basic validation (required fields, email format, password strength)
	•	If email already registered → show inline message with link to Sign In
	•	On success → create account and move to Onboarding Wizard

Wireframe (text):

[ SIGN UP ]

+----------------------------------------+
| MedReview Assist logo                  |
|                                        |
|  Create your account                   |
|  First name: [____________________]    |
|  Last name:  [____________________]    |
|  Email:      [____________________]    |
|  Password:   [____________________]    |
|              (strength bar)            |
|  Role: [Accredited Consultant ▼]       |
|  AHPRA No. (optional): [__________]    |
|  Organisation (optional): [________]   |
|                                        |
|  [ ] I agree to Terms & Privacy        |
|  [ ] I understand this is decision     |
|      support only.                     |
|                                        |
|          [ Create account ]            |
|  Already have an account? [Sign in]    |
+----------------------------------------+


⸻

Screen 1.3 – Onboarding Wizard (3–4 steps)

Step 1 – Professional details:
	•	Confirm: Name, Role, AHPRA number
	•	Toggles: “I conduct: [ ] HMRs [ ] RMMRs” (multi-select)

Step 2 – Organisation context (optional):
	•	Independent consultant vs Organisation member radio buttons
	•	Fields if organisation: Org name, Practice name, email footer settings, logo upload

Step 3 – Compliance info:
	•	Short explanatory text:
	•	Data hosted in Australia
	•	Health information treated as sensitive
	•	System provides suggestions only
	•	Checkbox: “I have read and understood this information.”

Step 4 – Quick tour:
	•	Simple illustrations or bullet points describing the core workflow:
	•	New Review → Enter meds & notes → AI suggestions → Edit → Export PDF
	•	Button: “Go to Dashboard”

Wireframe (text):

[ ONBOARDING – Step 1: Professional ]

Name: John Pharmacist
Role: Accredited Consultant Pharmacist
AHPRA No.: [__________]

I conduct:
[ x ] HMRs
[ x ] RMMRs

[ Back ]                 [ Next ]


⸻

4. Flow 2 – Pharmacist Dashboard & Case Management

Screen 2.1 – Dashboard (Home)

Goal: Provide a clear overview of current workload and quick entry into starting a new review.

Main elements:
	•	Top navigation bar
	•	Logo
	•	Menu: Dashboard, Patients, Settings
	•	User menu (Profile, Sign out)
	•	Main CTA button: “New Review”
	•	Search bar: search by patient name, GP name, or review ID
	•	Filters:
	•	Review Type: All / HMR / RMMR
	•	Status: Draft / Awaiting GP / Submitted / Archived
	•	Reviews table:
	•	Patient name
	•	Review Type (HMR/RMMR)
	•	GP
	•	Created Date
	•	Status
	•	Action: View / Open

Interactions:
	•	Click “New Review” → New Review Wizard (Flow 3)
	•	Click table row or “View” → open Review Workspace
	•	Search and filters update the table in real time

Wireframe (text):

[ DASHBOARD ]

Top bar: [Logo]  | Dashboard | Patients | Settings | [User ▼]

-------------------------------------------------------------
[ New Review ]      Search: [ Patient / GP / ID ________ ]

Filters:   Type: [ All ▼ ]   Status: [ All ▼ ]

-------------------------------------------------------------
| Patient        | Type | GP           | Status  | Action   |
-------------------------------------------------------------
| John Smith     | HMR  | Dr. Lee      | Draft   | [Open]   |
| Margaret Brown | RMMR | Dr. Taylor   | Sent    | [Open]   |
| ...                                                    ...|
-------------------------------------------------------------
Pagination:  1  2  3  Next >


⸻

5. Flow 3 – Create Patient & New Review

Screen 3.1 – New Review Wizard: Step 1 (Select or Create Patient)

Options:
	•	Search existing patient
	•	Search box with live results (name, DOB, last review date)
	•	“Select” button on each result
	•	Create new patient
	•	Button: “Create New Patient”

New patient fields:
	•	Full name
	•	Date of birth
	•	Sex
	•	Address (optional)
	•	Medicare number (optional; show privacy note)
	•	Residential setting: Home / Residential aged care facility (RACF) / Other

Interactions:
	•	Must either select an existing patient or create a new one to proceed

Wireframe (text):

[ NEW REVIEW – Step 1: Patient ]

Search existing patient: [____________________]

Results:
- John Smith, DOB 01/01/1940   [ Select ]
- Jane Doe, DOB 05/03/1952     [ Select ]

Or:
[ Create New Patient ]

If "Create New Patient":

Name: [_______________________]
DOB:  [__ / __ / ____]   Sex: [▼]
Address: [____________________]
Setting: (o) Home   ( ) RACF   ( ) Other

[ Back ]                         [ Next: Review context ]


⸻

Screen 3.2 – New Review Wizard: Step 2 (Review Context)

Fields:
	•	Review type: radio buttons
	•	(o) HMR   ( ) RMMR
	•	Referring GP:
	•	GP name
	•	Practice name
	•	Contact (email/fax)
	•	Reason for referral: free text or structured options (e.g., polypharmacy, falls, adherence, cognitive decline)
	•	Interview date: date picker

Interactions:
	•	All required fields validated on submit
	•	“Next” leads into Medications input

Wireframe (text):

[ NEW REVIEW – Step 2: Review context ]

Patient: John Smith (DOB 01/01/1940)

Review Type:
(o) HMR   ( ) RMMR

Referring GP:
  GP name:      [Dr. Lee          ]
  Practice:     [City Medical Ctr ]
  Contact (email/fax): [__________]

Reason for referral:
[ free text multi-line field                       ]

Interview date: [ __ / __ / ____ ]

[ Back ]                         [ Next: Medications ]


⸻

6. Flow 4 – Input Medication List & Clinical Notes

This is a key usability and time-saving area.

Screen 4.1 – Review Workspace: Medications

Layout:
	•	Tabbed workspace at top:
	•	Medications
	•	Symptoms & History
	•	AI Summary
	•	Report Draft
	•	Within “Medications” tab: two-column layout
	•	Left: Medication List table
	•	Right: Input helper panel (bulk paste / scan / dictation)

Per medication fields:
	•	Drug name (generic/brand)
	•	Strength
	•	Form (tablet, capsule, etc.)
	•	Dose
	•	Frequency
	•	Route
	•	Indication
	•	Start date (optional)
	•	Prescriber (optional)
	•	Comments (e.g., adherence, patient-reported use)

Input methods:
	1.	Structured form entry: Add one medication at a time using a simple form.
	2.	Bulk paste: Paste a list from GP letter/dispensing record; system parses into structured entries.
	3.	Scan (OCR): Upload a photo/scan of the med list; show parsed suggestions.
	4.	Dictation: Pharmacist speaks the list; system proposes structured entries.

Interactions:
	•	“Add medication” button opens a small modal or inline row editor
	•	Each row can be edited or deleted inline
	•	“Mark as ceased” toggle for ceased medications
	•	Basic validation: highlight missing critical information

Wireframe (text):

[ REVIEW WORKSPACE – Medications ]

Top tabs: [ Medications ] [ Symptoms & History ] [ AI Summary ] [ Report Draft ]

---------------------------------------------------------------
Left: Current Medication List

+------------------------------------------------------------+
| [ + Add medication ]  [ Bulk Paste ] [ Scan List ] [ Mic ] |
+------------------------------------------------------------+
| Drug name | Strength | Freq | Route | Indication |  ...   |
-------------------------------------------------------------
| Atorvastatin | 20 mg | OD  | oral  | cholesterol | [edit] |
| Metformin    | 500mg | BD  | oral  | T2DM        | [edit] |
| ...                                                         |
-------------------------------------------------------------

Right: Input helper panel

Bulk paste / Scan preview:

[ Text area for pasted/raw text                     ]

Parsed medications:
1) "Metformin 500mg BD"   [ Accept ] [ Edit ] [ Remove ]
2) "Atorvastatin 20mg OD" [ Accept ] [ Edit ] [ Remove ]


⸻

Screen 4.2 – Review Workspace: Symptoms & History

Sections:
	•	Presenting issues / symptoms
	•	Past medical history
	•	Allergies & adverse reactions
	•	Adherence & lifestyle notes
	•	Patient goals & concerns

Interactions:
	•	All as multi-line text areas
	•	Autosave indicator (e.g., “Saved 10s ago”)
	•	Optional “Mark as key point” toggle per section to highlight important factors for AI

Wireframe (text):

[ REVIEW WORKSPACE – Symptoms & History ]

Presenting issues
[ multi-line text area ]

Past medical history
[ multi-line text area ]

Allergies & adverse reactions
[ multi-line text area ]

Adherence & lifestyle
[ multi-line text area ]

Patient goals & concerns
[ multi-line text area ]

[ Save & Continue to AI Summary ]


⸻

7. Flow 5 – AI Clinical Suggestions & Evidence (Decision Support)

Screen 5.1 – Review Workspace: AI Summary

Purpose: Present AI-identified medication-related problems and supporting evidence, while clearly reinforcing human oversight.

Layout:
	•	Left panel: List of identified issues
	•	Right panel: Details of selected issue
	•	Banner at top with disclaimer message

Issue list item contents:
	•	Severity tag: Informational / Moderate / High
	•	Short title: e.g., “Fall risk: Drug A + Drug B”
	•	Category: Interaction / Dosing / Deprescribing / etc.
	•	Icon or colour to differentiate severity

Issue detail contents:
	•	Title & description in plain language
	•	Involved medications
	•	Clinical rationale
	•	Evidence summary/snippets referencing public resources (TGA PI/CMI, PBS, etc.)
	•	Suggested wording for the report (insertable text)
	•	Toggle/checkbox: “Include this in draft report”

Interactions:
	•	Click an issue in the left panel to view details on the right
	•	“Insert into report” button adds suggested wording into relevant section of the report draft
	•	Ability to edit suggested wording before or after inserting
	•	Visual marker on issues that have already been inserted into the report

Banner text example:
	•	“This tool provides clinical decision support only. You remain responsible for final clinical decisions and recommendations.”

Wireframe (text):

[ REVIEW WORKSPACE – AI Summary ]

Banner: "Decision support only – you are the final clinical decision-maker."

-----------------------------------------------------------
Left: Identified Issues        | Right: Issue Detail      
-----------------------------------------------------------
[High] Fall risk               | Title: Fall risk         
      Drug A + Drug B          |                          
[Mod] Renal dosing concern     | Description:             
      Drug C vs eGFR           | "Combination of ..."    
[Info] Deprescribing option    |                          
      Long-term PPI use        | Evidence summary:        
                               | - TGA PI: [View]         
                               | - CMI: [View]            
                               |                          
                               | Suggested report text:   
                               |  "The combination of..." 
                               | [ Insert into report ]   
                               | [ Include in draft □ ]   
-----------------------------------------------------------


⸻

8. Flow 6 – Report Drafting & Editing (Human in the Loop)

Screen 6.1 – Review Workspace: Report Draft

Purpose: Allow pharmacist to review and edit a structured report before finalising.

Layout:
	•	Left: Report sections navigation
	•	Centre: Editable report (rich text editor)
	•	Right: Contextual sidebar
	•	AI suggestions (for insertion)
	•	Patient summary & medication snapshot
	•	Evidence references

Standard report sections:
	1.	Patient details & context
	2.	Reason for review
	3.	Summary of findings
	4.	Medication-by-medication recommendations
	5.	Deprescribing and regimen simplification
	6.	Monitoring and follow-up recommendations
	7.	Patient education & adherence plan
	8.	Pharmacist sign-off and disclaimer

Interactions:
	•	Button: “Generate initial draft” – uses meds, notes, and selected issues to create a full draft
	•	Pharmacist can freely edit text in each section
	•	Section status indicator: e.g., a tick/circle showing Reviewed / Not reviewed
	•	Side panel suggestions: clicking “Insert” adds text at cursor or at section-specific insertion point
	•	Optional change-highlighting to show AI-generated vs user-modified content
	•	“Preview PDF” button to see final layout

Standard disclaimer text (in report tail):
	•	“This report was generated with the assistance of clinical decision support software. All recommendations have been reviewed and approved by [Pharmacist Name], who assumes responsibility for the clinical content.”

Wireframe (text):

[ REVIEW WORKSPACE – Report Draft ]

Left Nav:
- [✓] Patient details
- [✓] Reason for review
- [ ] Summary of findings
- [ ] Medication recommendations
- [ ] Deprescribing
- [ ] Monitoring / Follow-up
- [ ] Patient education

Center (document editor):
-----------------------------------------------------------
Patient details
"John Smith is an 84-year-old male living at home..."

Summary of findings
"Mr Smith presents with a history of falls and dizziness..."

Medication recommendations
"1. Atorvastatin 20 mg OD – continue, with monitoring of..."
-----------------------------------------------------------

Right Sidebar:
-----------------------------------------------------------
Suggestions:
- "Falls risk recommendation" [Insert]
- "Renal dose adjustment"    [Insert]

Patient snapshot:
- Age, gender, setting
- Key comorbidities

Evidence references:
- TGA PI: Drug A [View]
- PBS: listing for Drug B [View]
-----------------------------------------------------------

Top-right buttons:
[ Generate draft ]  [ Preview PDF ]  [ Save draft ]  [ Finalise ]


⸻

9. Flow 7 – Export & Share Report with GP

Screen 7.1 – Finalisation Modal

Triggered by: Clicking “Finalise” from the Report Draft screen.

Steps / elements:
	•	Checklist:
	•	“All report sections reviewed”
	•	“Medication list verified”
	•	“Recommendations reflect my professional judgement”
	•	Signature block:
	•	Name, qualifications, AHPRA number, contact
	•	Report date (auto-filled, editable)
	•	Delivery method:
	•	(o) Email to GP (uses stored GP email)
	•	( ) Download PDF only
	•	( ) Mark as printed/faxed (for record only)
	•	Confirmation checkbox:
	•	“I confirm I have reviewed this report and accept responsibility for its clinical content.”

Post-finalisation behaviour:
	•	Status of review changes to “Submitted”
	•	Immutable PDF snapshot stored
	•	Editing locked unless “Reopen for amendment” is explicitly used (with reason captured for audit trail)

Wireframe (text):

[ Finalise Report ]

Checklist:
[✓] All sections reviewed
[✓] Medication list confirmed
[ ] I confirm I have reviewed this report and accept
    responsibility for its clinical content.

Signature block:
[ Pharmacist Name, Accreditation No., Contact details ]

Report date: [ __ / __ / ____ ]

Send to GP:
(o) Email to Dr. Lee (dr.lee@clinic.com)
( ) Download PDF only
( ) Mark as printed/faxed

[ Cancel ]                         [ Finalise & Send ]


⸻

10. Flow 8 – Patients & Review History

Screen 8.1 – Patients List

Goal: Allow quick access to patient profiles and past reviews.

Elements:
	•	Search bar (by name, DOB, Medicare number)
	•	Table:
	•	Patient name
	•	DOB
	•	Setting (Home / RACF)
	•	Last review date
	•	Action: View

Interactions:
	•	Clicking a patient opens the Patient Profile screen

Screen 8.2 – Patient Profile

Sections:
	•	Header with demographics
	•	Tabs: Overview / Reviews / Notes

Overview tab:
	•	Basic info: age, sex, address, setting
	•	Quick summary: Last review type/date, key notes

Reviews tab:
	•	Table of all reviews for this patient:
	•	Date
	•	Type (HMR/RMMR)
	•	GP
	•	Status
	•	Action: View report
	•	Button: “Start new review for this patient”

Notes tab:
	•	Internal notes not visible in GP report

Wireframe (text):

[ PATIENT PROFILE – John Smith ]

Demographics (top):
- DOB: 01/01/1940  Age: 84  Sex: Male
- Setting: Home
- Address: ...

Tabs: [ Overview ] [ Reviews ] [ Notes ]

[Overview]
- Last review: HMR on 12/03/2025 (Dr. Lee)
- Flags: falls risk, cognitive impairment

[Reviews]
---------------------------------------------
| Date       | Type | GP       | Status |   |
---------------------------------------------
|12/03/2025  | HMR  | Dr. Lee  | Sent   |View|
|01/01/2024  | HMR  | Dr. Chan | Sent   |View|
---------------------------------------------

[ Start new review ]


⸻

11. Flow 9 – Compliance: Consent, Disclaimers, Audit Trail

Screen 11.1 – Consent Capture (within each Review)

Placement: Within the Review Workspace, ideally on the “Patient details” or a small “Consent” panel.

Fields:
	•	Checkbox: “I obtained informed consent from the patient (or their representative) to conduct this medication review and document their health information in this system.”
	•	Date/time consent obtained
	•	Notes: short free text area for any consent-related comments

Behaviour:
	•	Not technically mandatory to proceed, but warned if left unchecked at finalisation

Wireframe (text):

[ CONSENT PANEL ]

[ ] I obtained informed consent from the patient / representative
Date/time: [ __ / __ / ____  __:__ ]
Notes: [______________________________]


⸻

Screen 11.2 – Audit Trail (Review History)

Purpose: Provide a time-ordered log of key events for medico-legal defensibility.

Events might include:
	•	Review created (by whom, when)
	•	Patient and meds added/edited
	•	AI suggestions generated
	•	Report draft generated
	•	Significant edits (grouped by user and time)
	•	Finalisation (who, when, delivery method)
	•	Any reopening/amendments with reasons

Wireframe (text):

[ REVIEW – History ]

Timeline:
- 10:05  Review created by J. Pharmacist
- 10:10  Medication list updated (5 items added)
- 10:18  AI suggestions generated
- 10:25  Report draft generated
- 10:40  Report edited by J. Pharmacist
- 10:55  Finalised & sent to Dr. Lee (email)


⸻

12. Flow 10 – Organisation / Admin

Screen 12.1 – Organisation Settings

Audience: Users with admin role.

Tabs:
	•	Organisation
	•	Templates
	•	Users
	•	Compliance

Organisation tab:
	•	Organisation name
	•	Logo upload
	•	Default signature block for pharmacists (can be overridden per user)

Templates tab:
	•	Default HMR report template (headings, default wording)
	•	Default RMMR report template
	•	Ability to reset to system defaults

Users tab:
	•	List of users: Name, Email, Role (Admin/Pharmacist), Status
	•	Button: “Invite new user” (email invitation)

Compliance tab:
	•	Display/edit text for:
	•	Privacy statement
	•	Data residency statement
	•	Global report disclaimer appended to all reports

Wireframe (text):

[ SETTINGS – Organisation ]

Tabs: [ Organisation ] [ Templates ] [ Users ] [ Compliance ]

Organisation:
Name: [_________________]
Logo: [Upload]
Default signature block:
[ multi-line text area ]

Templates:
- Default HMR template [ Edit ]
- Default RMMR template [ Edit ]

Users:
-------------------------------------------
| Name             | Email          |Role |
-------------------------------------------
| J. Pharmacist    | j@pharm.com    |Admin|
| A. Pharmacist    | a@pharm.com    |User |
-------------------------------------------
[ Invite new user ]

Compliance:
- Privacy statement [ Edit ]
- Data residency statement [ Edit ]
- Default report disclaimer [ Edit ]


⸻

13. Key User Stories (Backlog Seeds)
	1.	As an accredited pharmacist, I want to sign up and specify my professional details so that reports show correct credentials.
	2.	As an accredited pharmacist, I want to create a new HMR/RMMR review for a patient so that I can document my assessment and recommendations.
	3.	As an accredited pharmacist, I want to enter or import a patient’s medication list quickly in multiple ways so that I don’t waste time on manual data entry.
	4.	As an accredited pharmacist, I want the system to highlight potential medication-related problems with evidence from Australian public resources so that I can review them efficiently.
	5.	As an accredited pharmacist, I want to generate a draft report and edit it so that the final document accurately reflects my clinical judgement.
	6.	As an accredited pharmacist, I want to export or email a PDF report to the GP in a standard format so that it integrates smoothly into their workflow.
	7.	As an accredited pharmacist, I want to view previous reviews and reports for a patient so that I can factor in historical information.
	8.	As a compliance-conscious clinician, I want an audit trail of significant actions on each review so that I can demonstrate how the report was created and reviewed.
	9.	As an organisation admin, I want to manage templates, branding, and users so that all reports from my service look consistent and professional.

⸻

This document can be used directly by designers and developers to create detailed UI designs and implementation tasks without prescribing any specific technology stack.
