import apiClient from './client';
import { GP } from '@/types';

export interface GPCreate {
  name: string;
  practice_name?: string;
  email?: string;
  fax?: string;
}

export interface GPUpdate extends Partial<GPCreate> {}

export const gpsApi = {
  list: async (search?: string) => {
    const response = await apiClient.get<GP[]>('/gps', { params: { search } });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<GP>(`/gps/${id}`);
    return response.data;
  },

  create: async (data: GPCreate) => {
    const response = await apiClient.post<GP>('/gps', data);
    return response.data;
  },

  update: async (id: string, data: GPUpdate) => {
    const response = await apiClient.put<GP>(`/gps/${id}`, data);
    return response.data;
  },
};
