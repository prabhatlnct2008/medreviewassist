import apiClient from './client';
import { Patient, PaginatedResponse, ReviewSummary } from '@/types';

export interface PatientCreate {
  full_name: string;
  date_of_birth: string;
  sex: string;
  address?: string;
  medicare_number?: string;
  residential_setting?: string;
}

export interface PatientUpdate extends Partial<PatientCreate> {}

export const patientsApi = {
  list: async (params?: { search?: string; page?: number; page_size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  create: async (data: PatientCreate) => {
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: PatientUpdate) => {
    const response = await apiClient.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  getReviews: async (id: string) => {
    const response = await apiClient.get<ReviewSummary[]>(`/patients/${id}/reviews`);
    return response.data;
  },
};
