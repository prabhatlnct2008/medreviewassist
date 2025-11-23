import apiClient from './client';
import { AISuggestion } from '@/types';

export const aiApi = {
  generateSuggestions: async (reviewId: string) => {
    const response = await apiClient.post<AISuggestion[]>(`/reviews/${reviewId}/ai/generate`);
    return response.data;
  },

  getSuggestions: async (reviewId: string) => {
    const response = await apiClient.get<AISuggestion[]>(`/reviews/${reviewId}/ai/suggestions`);
    return response.data;
  },

  updateSuggestion: async (
    reviewId: string,
    suggestionId: string,
    data: { is_included_in_report?: boolean; is_dismissed?: boolean }
  ) => {
    const response = await apiClient.put<AISuggestion>(
      `/reviews/${reviewId}/ai/suggestions/${suggestionId}`,
      data
    );
    return response.data;
  },
};
