import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi, LoginData, SignupData, OnboardingData } from '@/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authApi.login(data);
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);

          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.detail || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.signup(data);
          // After signup, log the user in
          await get().login({ email: data.email, password: data.password });
        } catch (error: any) {
          const message = error.response?.data?.detail || 'Signup failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      completeOnboarding: async (data: OnboardingData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.completeOnboarding(data);
          set({ user, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.detail || 'Onboarding failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
