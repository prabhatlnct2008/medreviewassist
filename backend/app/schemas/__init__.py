from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    OnboardingData,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    MessageResponse,
)
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientListResponse,
    PaginatedPatients,
)
from app.schemas.gp import GPCreate, GPUpdate, GPResponse
from app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewSummary,
    ReviewDetailResponse,
    PaginatedReviews,
)
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    BulkMedicationCreate,
    ParseMedicationRequest,
    ParsedMedication,
)
from app.schemas.clinical_note import ClinicalNoteUpdate, ClinicalNoteResponse
from app.schemas.ai_suggestion import AISuggestionUpdate, AISuggestionResponse
from app.schemas.report import (
    ReportDraftResponse,
    ReportDraftUpdate,
    FinalizeRequest,
    SendReportRequest,
    ReopenRequest,
)
from app.schemas.consent import ConsentUpdate, ConsentResponse
from app.schemas.audit import AuditLogResponse
from app.schemas.settings import (
    UserSettingsResponse,
    UserSettingsUpdate,
    TemplateUpdateRequest,
    ResetTemplateRequest,
    ProfileUpdateRequest,
)
