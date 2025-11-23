import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, ProfileUpdate, Template, UserPreferences } from '@/api/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useTemplate(type: 'hmr' | 'rmmr') {
  return useQuery({
    queryKey: ['template', type],
    queryFn: () => settingsApi.getTemplate(type),
  });
}

export function useUpdateTemplate(type: 'hmr' | 'rmmr') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Template) => settingsApi.updateTemplate(type, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', type] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useResetTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.resetTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: settingsApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdate) => settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: settingsApi.getPreferences,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) => settingsApi.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
