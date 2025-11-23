import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, PatientCreate, PatientUpdate } from '@/api/patients';

export function usePatients(params?: { search?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsApi.list(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.get(id),
    enabled: !!id,
  });
}

export function usePatientReviews(patientId: string) {
  return useQuery({
    queryKey: ['patientReviews', patientId],
    queryFn: () => patientsApi.getReviews(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientCreate) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientUpdate) => patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
