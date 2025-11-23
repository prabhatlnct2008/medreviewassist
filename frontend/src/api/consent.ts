import apiClient from './client';

export interface Consent {
  id: string;
  review_id: string;
  obtained: boolean;
  obtained_at: string | null;
  notes: string | null;
}

export interface ConsentUpdate {
  obtained: boolean;
  notes?: string;
}

export const consentApi = {
  getConsent: async (reviewId: string): Promise<Consent> => {
    const response = await apiClient.get<Consent>(`/reviews/${reviewId}/consent`);
    return response.data;
  },

  updateConsent: async (reviewId: string, data: ConsentUpdate): Promise<Consent> => {
    const response = await apiClient.put<Consent>(`/reviews/${reviewId}/consent`, data);
    return response.data;
  },
};
