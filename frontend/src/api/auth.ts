import apiClient from './client';
import { User, TokenResponse } from '@/types';

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  ahpra_number?: string;
  organisation_name?: string;
  terms_accepted: boolean;
  clinical_responsibility_accepted: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  ahpra_number?: string;
  conducts_hmr: boolean;
  conducts_rmmr: boolean;
  organisation_name?: string;
  compliance_acknowledged: boolean;
}

export const authApi = {
  signup: async (data: SignupData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  completeOnboarding: async (data: OnboardingData): Promise<User> => {
    const response = await apiClient.post<User>('/users/me/onboarding', data);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data);
    return response.data;
  },
};
