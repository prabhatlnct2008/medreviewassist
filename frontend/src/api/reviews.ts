import apiClient from './client';
import { Review, ReviewDetail, ReviewSummary, PaginatedResponse, Medication, ClinicalNote, Consent } from '@/types';

export interface ReviewCreate {
  patient_id: string;
  gp_id: string;
  review_type: string;
  reason_for_referral?: string;
  interview_date?: string;
}

export interface ReviewUpdate {
  reason_for_referral?: string;
  interview_date?: string;
  gp_id?: string;
}

export interface MedicationCreate {
  drug_name: string;
  strength?: string;
  form?: string;
  dose?: string;
  frequency?: string;
  route?: string;
  indication?: string;
  start_date?: string;
  prescriber?: string;
  comments?: string;
  is_ceased?: boolean;
}

export interface ClinicalNoteUpdate {
  content?: string;
  is_key_point?: boolean;
}

export interface ConsentUpdate {
  obtained: boolean;
  notes?: string;
}

export const reviewsApi = {
  list: async (params?: {
    search?: string;
    review_type?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<ReviewSummary>>('/reviews', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ReviewDetail>(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: ReviewCreate) => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  update: async (id: string, data: ReviewUpdate) => {
    const response = await apiClient.put<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/reviews/${id}`);
  },

  // Medications
  getMedications: async (reviewId: string) => {
    const response = await apiClient.get<Medication[]>(`/reviews/${reviewId}/medications`);
    return response.data;
  },

  addMedication: async (reviewId: string, data: MedicationCreate) => {
    const response = await apiClient.post<Medication>(`/reviews/${reviewId}/medications`, data);
    return response.data;
  },

  addMedicationsBulk: async (reviewId: string, medications: MedicationCreate[]) => {
    const response = await apiClient.post<Medication[]>(`/reviews/${reviewId}/medications/bulk`, { medications });
    return response.data;
  },

  updateMedication: async (reviewId: string, medicationId: string, data: Partial<MedicationCreate>) => {
    const response = await apiClient.put<Medication>(`/reviews/${reviewId}/medications/${medicationId}`, data);
    return response.data;
  },

  deleteMedication: async (reviewId: string, medicationId: string) => {
    await apiClient.delete(`/reviews/${reviewId}/medications/${medicationId}`);
  },

  parseMedications: async (reviewId: string, text: string) => {
    const response = await apiClient.post(`/reviews/${reviewId}/medications/parse`, { text });
    return response.data;
  },

  // Clinical Notes
  getClinicalNotes: async (reviewId: string) => {
    const response = await apiClient.get<ClinicalNote[]>(`/reviews/${reviewId}/notes`);
    return response.data;
  },

  updateClinicalNote: async (reviewId: string, section: string, data: ClinicalNoteUpdate) => {
    const response = await apiClient.put<ClinicalNote>(`/reviews/${reviewId}/notes/${section}`, data);
    return response.data;
  },

  // Consent
  getConsent: async (reviewId: string) => {
    const response = await apiClient.get<Consent>(`/reviews/${reviewId}/consent`);
    return response.data;
  },

  updateConsent: async (reviewId: string, data: ConsentUpdate) => {
    const response = await apiClient.put<Consent>(`/reviews/${reviewId}/consent`, data);
    return response.data;
  },
};
