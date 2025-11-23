import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '@/components/ui';
import { User, FileText, Settings as SettingsIcon, RotateCcw, Save, Check } from 'lucide-react';
import { useProfile, useUpdateProfile, useTemplate, useUpdateTemplate, useResetTemplates, usePreferences, useUpdatePreferences } from '@/hooks/useSettings';
import { Template, TemplateSection } from '@/api/settings';

type TabType = 'profile' | 'templates' | 'preferences';

const tabs: { id: TabType; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'templates', label: 'Report Templates', icon: FileText },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'templates' && <TemplateSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ahpra_number: '',
    organisation_name: '',
    conducts_hmr: true,
    conducts_rmmr: true,
    signature_line: '',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when profile loads
  if (profile && !isInitialized) {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      ahpra_number: profile.ahpra_number || '',
      organisation_name: profile.organisation_name || '',
      conducts_hmr: profile.conducts_hmr ?? true,
      conducts_rmmr: profile.conducts_rmmr ?? true,
      signature_line: '',
    });
    setIsInitialized(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">AHPRA Registration Number</label>
            <input
              type="text"
              value={formData.ahpra_number}
              onChange={(e) => setFormData({ ...formData, ahpra_number: e.target.value })}
              placeholder="e.g., PHA0001234567"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Organisation Name</label>
            <input
              type="text"
              value={formData.organisation_name}
              onChange={(e) => setFormData({ ...formData, organisation_name: e.target.value })}
              placeholder="e.g., Community Pharmacy Services"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review Types</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.conducts_hmr}
                  onChange={(e) => setFormData({ ...formData, conducts_hmr: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Conducts HMR</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.conducts_rmmr}
                  onChange={(e) => setFormData({ ...formData, conducts_rmmr: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Conducts RMMR</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Signature Line</label>
            <textarea
              value={formData.signature_line}
              onChange={(e) => setFormData({ ...formData, signature_line: e.target.value })}
              placeholder="Your signature line for reports..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : updateProfile.isSuccess ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {updateProfile.isPending ? 'Saving...' : updateProfile.isSuccess ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TemplateSettings() {
  const [selectedTemplate, setSelectedTemplate] = useState<'hmr' | 'rmmr'>('hmr');
  const { data: templateData, isLoading } = useTemplate(selectedTemplate);
  const updateTemplate = useUpdateTemplate(selectedTemplate);
  const resetTemplates = useResetTemplates();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState('');

  const sections = [
    { key: 'patient_details', label: 'Patient Details' },
    { key: 'reason_for_review', label: 'Reason for Review' },
    { key: 'summary_of_findings', label: 'Summary of Findings' },
    { key: 'medication_recommendations', label: 'Medication Recommendations' },
    { key: 'deprescribing', label: 'Deprescribing Considerations' },
    { key: 'monitoring_followup', label: 'Monitoring & Follow-up' },
    { key: 'patient_education', label: 'Patient Education' },
    { key: 'pharmacist_signoff', label: 'Pharmacist Sign-off' },
  ];

  const handleEditSection = (key: string) => {
    const template = templateData?.template as Template;
    const section = template?.[key as keyof Template] as TemplateSection | undefined;
    setEditingSection(key);
    setSectionContent(section?.template || '');
  };

  const handleSaveSection = async () => {
    if (!editingSection || !templateData) return;

    const currentTemplate = { ...(templateData.template as Template) };
    const currentSection = currentTemplate[editingSection as keyof Template] as TemplateSection;

    const updatedTemplate = {
      ...currentTemplate,
      [editingSection]: {
        ...currentSection,
        template: sectionContent,
      },
    };

    await updateTemplate.mutateAsync(updatedTemplate);
    setEditingSection(null);
  };

  const handleReset = async () => {
    if (confirm(`Are you sure you want to reset the ${selectedTemplate.toUpperCase()} template to defaults?`)) {
      await resetTemplates.mutateAsync(selectedTemplate);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report Templates</CardTitle>
          <div className="flex gap-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as 'hmr' | 'rmmr')}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="hmr">HMR Template</option>
              <option value="rmmr">RMMR Template</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={resetTemplates.isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Customize the default content for each section of your {selectedTemplate.toUpperCase()} reports.
            Use placeholders like {'{patient_name}'}, {'{dob}'}, {'{gp_name}'} for dynamic content.
          </p>

          <div className="space-y-3">
            {sections.map((section) => {
              const template = templateData?.template as Template;
              const sectionData = template?.[section.key as keyof Template] as TemplateSection | undefined;
              const isEditing = editingSection === section.key;

              return (
                <div key={section.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{section.label}</h4>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSection(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveSection}
                          disabled={updateTemplate.isPending}
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection(section.key)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={sectionContent}
                      onChange={(e) => setSectionContent(e.target.value)}
                      className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    />
                  ) : (
                    <pre className="text-xs text-muted-foreground bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                      {sectionData?.template || 'No template content'}
                    </pre>
                  )}

                  {sectionData?.instructions && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {sectionData.instructions}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesSettings() {
  const { data: prefsData, isLoading } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const [formData, setFormData] = useState({
    auto_save_interval: 30,
    show_ai_confidence: true,
    default_review_type: 'hmr',
    email_copy_to_self: false,
    date_format: 'dd/MM/yyyy',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when preferences load
  if (prefsData?.preferences && !isInitialized) {
    setFormData({
      auto_save_interval: prefsData.preferences.auto_save_interval ?? 30,
      show_ai_confidence: prefsData.preferences.show_ai_confidence ?? true,
      default_review_type: prefsData.preferences.default_review_type ?? 'hmr',
      email_copy_to_self: prefsData.preferences.email_copy_to_self ?? false,
      date_format: prefsData.preferences.date_format ?? 'dd/MM/yyyy',
    });
    setIsInitialized(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Auto-save Interval</label>
            <select
              value={formData.auto_save_interval}
              onChange={(e) => setFormData({ ...formData, auto_save_interval: parseInt(e.target.value) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">How often to auto-save draft reports</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Review Type</label>
            <select
              value={formData.default_review_type}
              onChange={(e) => setFormData({ ...formData, default_review_type: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="hmr">Home Medicines Review (HMR)</option>
              <option value="rmmr">Residential Medication Management Review (RMMR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Format</label>
            <select
              value={formData.date_format}
              onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY (Australian)</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.show_ai_confidence}
                onChange={(e) => setFormData({ ...formData, show_ai_confidence: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm">Show AI confidence scores</span>
            </label>
            <p className="text-xs text-muted-foreground ml-6">Display confidence levels for AI-generated suggestions</p>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.email_copy_to_self}
                onChange={(e) => setFormData({ ...formData, email_copy_to_self: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm">Send copy to self when emailing reports</span>
            </label>
            <p className="text-xs text-muted-foreground ml-6">Receive a copy of sent reports at your email address</p>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : updatePreferences.isSuccess ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {updatePreferences.isPending ? 'Saving...' : updatePreferences.isSuccess ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
