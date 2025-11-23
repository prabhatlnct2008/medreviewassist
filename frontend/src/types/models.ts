import {
  UserRole,
  Sex,
  ResidentialSetting,
  ReviewType,
  ReviewStatus,
  ClinicalNoteSection,
  SuggestionSeverity,
  SuggestionCategory,
} from './enums';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  ahpra_number: string | null;
  organisation_name: string | null;
  conducts_hmr: boolean;
  conducts_rmmr: boolean;
  onboarding_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string;
  sex: Sex;
  address: string | null;
  medicare_number: string | null;
  residential_setting: ResidentialSetting;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface GP {
  id: string;
  name: string;
  practice_name: string | null;
  email: string | null;
  fax: string | null;
  created_by_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  patient_id: string;
  pharmacist_id: string;
  gp_id: string;
  review_type: ReviewType;
  status: ReviewStatus;
  reason_for_referral: string | null;
  interview_date: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  id: string;
  patient_name: string;
  review_type: ReviewType;
  gp_name: string;
  status: ReviewStatus;
  created_at: string;
}

export interface ReviewDetail extends Review {
  patient: Patient;
  gp: GP;
}

export interface Medication {
  id: string;
  review_id: string;
  drug_name: string;
  strength: string | null;
  form: string | null;
  dose: string | null;
  frequency: string | null;
  route: string;
  indication: string | null;
  start_date: string | null;
  prescriber: string | null;
  comments: string | null;
  is_ceased: boolean;
  order_index: number;
  created_at: string;
}

export interface ClinicalNote {
  id: string;
  review_id: string;
  section_type: ClinicalNoteSection;
  content: string | null;
  is_key_point: boolean;
  updated_at: string;
}

export interface AISuggestion {
  id: string;
  review_id: string;
  severity: SuggestionSeverity;
  title: string;
  category: SuggestionCategory;
  description: string;
  involved_medications: string[] | null;
  clinical_rationale: string | null;
  evidence_summary: string | null;
  suggested_text: string | null;
  is_included_in_report: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface ReportDraft {
  id: string;
  review_id: string;
  sections: Record<string, { content: string; reviewed: boolean }>;
  generated_at: string | null;
  last_edited_at: string | null;
  is_finalized: boolean;
}

export interface Consent {
  id: string;
  review_id: string;
  obtained: boolean;
  obtained_at: string | null;
  notes: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
