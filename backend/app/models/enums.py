import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PHARMACIST = "pharmacist"


class Sex(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ResidentialSetting(str, enum.Enum):
    HOME = "home"
    RACF = "racf"
    OTHER = "other"


class ReviewType(str, enum.Enum):
    HMR = "hmr"
    RMMR = "rmmr"


class ReviewStatus(str, enum.Enum):
    DRAFT = "draft"
    AWAITING_GP = "awaiting_gp"
    SUBMITTED = "submitted"
    ARCHIVED = "archived"


class ClinicalNoteSection(str, enum.Enum):
    PRESENTING_ISSUES = "presenting_issues"
    MEDICAL_HISTORY = "medical_history"
    ALLERGIES = "allergies"
    ADHERENCE_LIFESTYLE = "adherence_lifestyle"
    PATIENT_GOALS = "patient_goals"


class SuggestionSeverity(str, enum.Enum):
    INFO = "info"
    MODERATE = "moderate"
    HIGH = "high"


class SuggestionCategory(str, enum.Enum):
    INTERACTION = "interaction"
    DOSING = "dosing"
    DEPRESCRIBING = "deprescribing"
    ADHERENCE = "adherence"
    MONITORING = "monitoring"
    OTHER = "other"


class AuditAction(str, enum.Enum):
    CREATED = "created"
    UPDATED = "updated"
    MEDICATIONS_ADDED = "medications_added"
    AI_GENERATED = "ai_generated"
    DRAFT_GENERATED = "draft_generated"
    EDITED = "edited"
    FINALIZED = "finalized"
    REOPENED = "reopened"
    EXPORTED = "exported"
