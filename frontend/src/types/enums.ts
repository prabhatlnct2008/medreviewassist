export enum UserRole {
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ResidentialSetting {
  HOME = 'home',
  RACF = 'racf',
  OTHER = 'other',
}

export enum ReviewType {
  HMR = 'hmr',
  RMMR = 'rmmr',
}

export enum ReviewStatus {
  DRAFT = 'draft',
  AWAITING_GP = 'awaiting_gp',
  SUBMITTED = 'submitted',
  ARCHIVED = 'archived',
}

export enum ClinicalNoteSection {
  PRESENTING_ISSUES = 'presenting_issues',
  MEDICAL_HISTORY = 'medical_history',
  ALLERGIES = 'allergies',
  ADHERENCE_LIFESTYLE = 'adherence_lifestyle',
  PATIENT_GOALS = 'patient_goals',
}

export enum SuggestionSeverity {
  INFO = 'info',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export enum SuggestionCategory {
  INTERACTION = 'interaction',
  DOSING = 'dosing',
  DEPRESCRIBING = 'deprescribing',
  ADHERENCE = 'adherence',
  MONITORING = 'monitoring',
  OTHER = 'other',
}
