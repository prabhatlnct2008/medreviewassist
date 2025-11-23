import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/audit';

export function useAuditLogs(reviewId: string) {
  return useQuery({
    queryKey: ['auditLogs', reviewId],
    queryFn: () => auditApi.getAuditLogs(reviewId),
    enabled: !!reviewId,
  });
}
