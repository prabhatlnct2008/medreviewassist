import apiClient from './client';

export interface AuditLog {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export const auditApi = {
  getAuditLogs: async (reviewId: string, limit: number = 50): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(
      `/reviews/${reviewId}/audit?limit=${limit}`
    );
    return response.data;
  },
};
