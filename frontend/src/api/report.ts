import apiClient from './client';

export interface ReportSection {
  content: string;
  reviewed: boolean;
}

export interface ReportDraft {
  id: string;
  review_id: string;
  sections: Record<string, ReportSection>;
  generated_at: string | null;
  last_edited_at: string | null;
  is_finalized: boolean;
}

export interface SectionUpdateRequest {
  content: string;
  reviewed?: boolean;
}

export interface FinalizeRequest {
  delivery_method: 'email' | 'print' | 'both';
  pharmacist_signature: string;
  consent_confirmed: boolean;
}

export interface SendEmailRequest {
  recipient_email?: string;
}

export interface SendEmailResponse {
  success: boolean;
  recipient?: string;
  sent_at?: string;
  mock?: boolean;
  message?: string;
}

export const reportApi = {
  generateDraft: async (reviewId: string): Promise<ReportDraft> => {
    const response = await apiClient.post<ReportDraft>(`/reviews/${reviewId}/report/generate`);
    return response.data;
  },

  getDraft: async (reviewId: string): Promise<ReportDraft | null> => {
    const response = await apiClient.get<ReportDraft | null>(`/reviews/${reviewId}/report`);
    return response.data;
  },

  updateSection: async (
    reviewId: string,
    section: string,
    data: SectionUpdateRequest
  ): Promise<ReportDraft> => {
    const response = await apiClient.put<ReportDraft>(
      `/reviews/${reviewId}/report/sections/${section}`,
      data
    );
    return response.data;
  },

  markSectionReviewed: async (reviewId: string, section: string): Promise<ReportDraft> => {
    const response = await apiClient.put<ReportDraft>(
      `/reviews/${reviewId}/report/sections/${section}/review`
    );
    return response.data;
  },

  getPreviewPdfUrl: (reviewId: string): string => {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/reviews/${reviewId}/report/preview/pdf`;
  },

  getDownloadPdfUrl: (reviewId: string): string => {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/reviews/${reviewId}/report/download/pdf`;
  },

  downloadPdf: async (reviewId: string): Promise<Blob> => {
    const response = await apiClient.get(`/reviews/${reviewId}/report/download/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  finalizeReport: async (reviewId: string, data: FinalizeRequest): Promise<ReportDraft> => {
    const response = await apiClient.post<ReportDraft>(
      `/reviews/${reviewId}/report/finalize`,
      data
    );
    return response.data;
  },

  reopenReport: async (reviewId: string): Promise<ReportDraft> => {
    const response = await apiClient.post<ReportDraft>(
      `/reviews/${reviewId}/report/reopen`
    );
    return response.data;
  },

  sendEmail: async (reviewId: string, data: SendEmailRequest = {}): Promise<SendEmailResponse> => {
    const response = await apiClient.post<SendEmailResponse>(
      `/reviews/${reviewId}/report/send`,
      data
    );
    return response.data;
  },
};
