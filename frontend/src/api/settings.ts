import { apiClient } from './client';

export interface TemplateSection {
  heading: string;
  template: string;
  instructions: string;
}

export interface Template {
  patient_details?: TemplateSection;
  reason_for_review?: TemplateSection;
  summary_of_findings?: TemplateSection;
  medication_recommendations?: TemplateSection;
  deprescribing?: TemplateSection;
  monitoring_followup?: TemplateSection;
  patient_education?: TemplateSection;
  pharmacist_signoff?: TemplateSection;
}

export interface UserSettings {
  id: string;
  user_id: string;
  hmr_template: Template | null;
  rmmr_template: Template | null;
  preferences: Record<string, unknown> | null;
  signature_line: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  auto_save_interval: number;
  show_ai_confidence: boolean;
  default_review_type: string;
  email_copy_to_self: boolean;
  date_format: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  ahpra_number?: string;
  organisation_name?: string;
  conducts_hmr?: boolean;
  conducts_rmmr?: boolean;
  signature_line?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  ahpra_number: string | null;
  organisation_name: string | null;
  conducts_hmr: boolean;
  conducts_rmmr: boolean;
  onboarding_completed: boolean;
  is_active: boolean;
}

export const settingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },

  getTemplate: async (type: 'hmr' | 'rmmr'): Promise<{ template_type: string; template: Template }> => {
    const response = await apiClient.get(`/settings/templates/${type}`);
    return response.data;
  },

  updateTemplate: async (type: 'hmr' | 'rmmr', template: Template): Promise<{ template_type: string; template: Template }> => {
    const response = await apiClient.put(`/settings/templates/${type}`, {
      template_type: type,
      template,
    });
    return response.data;
  },

  resetTemplates: async (type: 'hmr' | 'rmmr' | 'all'): Promise<{ message: string; hmr_template?: Template; rmmr_template?: Template }> => {
    const response = await apiClient.post('/settings/templates/reset', {
      template_type: type,
    });
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdate): Promise<UserProfile> => {
    const response = await apiClient.put('/settings/profile', data);
    return response.data;
  },

  getPreferences: async (): Promise<{ preferences: UserPreferences }> => {
    const response = await apiClient.get('/settings/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> => {
    const response = await apiClient.put('/settings/preferences', preferences);
    return response.data;
  },
};
