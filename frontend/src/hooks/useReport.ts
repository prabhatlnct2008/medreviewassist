import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi, SectionUpdateRequest } from '@/api/report';

export function useReportDraft(reviewId: string) {
  return useQuery({
    queryKey: ['reportDraft', reviewId],
    queryFn: () => reportApi.getDraft(reviewId),
    enabled: !!reviewId,
  });
}

export function useGenerateReportDraft(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reportApi.generateDraft(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportDraft', reviewId] });
    },
  });
}

export function useUpdateReportSection(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ section, data }: { section: string; data: SectionUpdateRequest }) =>
      reportApi.updateSection(reviewId, section, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportDraft', reviewId] });
    },
  });
}

export function useMarkSectionReviewed(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (section: string) => reportApi.markSectionReviewed(reviewId, section),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportDraft', reviewId] });
    },
  });
}
