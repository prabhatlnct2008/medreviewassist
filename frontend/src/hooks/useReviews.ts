import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, ReviewCreate, ReviewUpdate } from '@/api/reviews';

export function useReviews(params?: {
  search?: string;
  review_type?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.list(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewCreate) => reviewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useUpdateReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewUpdate) => reviewsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useMedications(reviewId: string) {
  return useQuery({
    queryKey: ['medications', reviewId],
    queryFn: () => reviewsApi.getMedications(reviewId),
    enabled: !!reviewId,
  });
}

export function useClinicalNotes(reviewId: string) {
  return useQuery({
    queryKey: ['clinicalNotes', reviewId],
    queryFn: () => reviewsApi.getClinicalNotes(reviewId),
    enabled: !!reviewId,
  });
}

export function useConsent(reviewId: string) {
  return useQuery({
    queryKey: ['consent', reviewId],
    queryFn: () => reviewsApi.getConsent(reviewId),
    enabled: !!reviewId,
  });
}
