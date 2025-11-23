import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentApi, ConsentUpdate } from '@/api/consent';

export function useConsent(reviewId: string) {
  return useQuery({
    queryKey: ['consent', reviewId],
    queryFn: () => consentApi.getConsent(reviewId),
    enabled: !!reviewId,
  });
}

export function useUpdateConsent(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConsentUpdate) => consentApi.updateConsent(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent', reviewId] });
    },
  });
}
