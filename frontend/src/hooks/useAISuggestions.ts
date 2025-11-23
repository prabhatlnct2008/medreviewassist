import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/api/ai';

export function useAISuggestions(reviewId: string) {
  return useQuery({
    queryKey: ['aiSuggestions', reviewId],
    queryFn: () => aiApi.getSuggestions(reviewId),
    enabled: !!reviewId,
  });
}

export function useGenerateAISuggestions(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiApi.generateSuggestions(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiSuggestions', reviewId] });
    },
  });
}

export function useUpdateAISuggestion(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      suggestionId,
      data,
    }: {
      suggestionId: string;
      data: { is_included_in_report?: boolean; is_dismissed?: boolean };
    }) => aiApi.updateSuggestion(reviewId, suggestionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiSuggestions', reviewId] });
    },
  });
}
