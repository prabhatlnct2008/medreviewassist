import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gpsApi, GPCreate } from '@/api/gps';

export function useGPs(search?: string) {
  return useQuery({
    queryKey: ['gps', search],
    queryFn: () => gpsApi.list(search),
  });
}

export function useCreateGP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GPCreate) => gpsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gps'] });
    },
  });
}
