import { useState, useEffect, useCallback } from 'react';
import { useReportDraft, useGenerateReportDraft, useUpdateReportSection, useMarkSectionReviewed, useFinalizeReport, useReopenReport, useSendReportEmail } from '@/hooks/useReport';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { useConsent, useUpdateConsent } from '@/hooks/useConsent';
import { Button, Card, Spinner } from '@/components/ui';
import { FileText, RefreshCw, Check, ChevronRight, AlertTriangle, AlertCircle, Info, ClipboardCopy, Eye, Download, Lock, Unlock, Mail } from 'lucide-react';
import { reportApi } from '@/api/report';
import { useAuthStore } from '@/stores/authStore';
import { debounce } from '@/utils/debounce';
import { AISuggestion, SuggestionSeverity } from '@/types';
import { FinalizeModal } from './FinalizeModal';

interface ReportDraftTabProps {
  reviewId: string;
  onSave?: () => void;
}

const sectionConfig = [
  { key: 'patient_details', label: 'Patient Details', description: 'Patient demographics and review info' },
  { key: 'reason_for_review', label: 'Reason for Review', description: 'Referral reason and patient goals' },
  { key: 'summary_of_findings', label: 'Summary of Findings', description: 'Clinical assessment summary' },
  { key: 'medication_recommendations', label: 'Medication Recommendations', description: 'Specific medication changes' },
  { key: 'deprescribing', label: 'Deprescribing', description: 'Medications to reduce or cease' },
  { key: 'monitoring_followup', label: 'Monitoring & Follow-up', description: 'Ongoing monitoring plan' },
  { key: 'patient_education', label: 'Patient Education', description: 'Counselling provided' },
  { key: 'pharmacist_signoff', label: 'Pharmacist Sign-off', description: 'Final approval' },
];

const severityConfig: Record<SuggestionSeverity, { icon: typeof AlertTriangle; color: string }> = {
  [SuggestionSeverity.HIGH]: { icon: AlertTriangle, color: 'text-red-600' },
  [SuggestionSeverity.MODERATE]: { icon: AlertCircle, color: 'text-yellow-600' },
  [SuggestionSeverity.INFO]: { icon: Info, color: 'text-blue-600' },
};

export function ReportDraftTab({ reviewId, onSave }: ReportDraftTabProps) {
  const { data: draft, isLoading } = useReportDraft(reviewId);
  const { data: suggestions } = useAISuggestions(reviewId);
  const { data: consent } = useConsent(reviewId);
  const generateMutation = useGenerateReportDraft(reviewId);
  const updateMutation = useUpdateReportSection(reviewId);
  const markReviewedMutation = useMarkSectionReviewed(reviewId);
  const finalizeMutation = useFinalizeReport(reviewId);
  const reopenMutation = useReopenReport(reviewId);
  const updateConsentMutation = useUpdateConsent(reviewId);
  const sendEmailMutation = useSendReportEmail(reviewId);

  const [activeSection, setActiveSection] = useState('patient_details');
  const [editedContent, setEditedContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Get current section content
  const currentSectionData = draft?.sections?.[activeSection];

  // Sync edited content when section changes or draft loads
  useEffect(() => {
    if (currentSectionData) {
      setEditedContent(currentSectionData.content || '');
      setHasUnsavedChanges(false);
    }
  }, [activeSection, currentSectionData?.content]);

  // Debounced save
  const debouncedSave = useCallback(
    debounce((content: string) => {
      updateMutation.mutate(
        { section: activeSection, data: { content } },
        {
          onSuccess: () => {
            setHasUnsavedChanges(false);
            onSave?.();
          },
        }
      );
    }, 1500),
    [activeSection, updateMutation, onSave]
  );

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasUnsavedChanges(true);
    debouncedSave(content);
  };

  const handleGenerate = async () => {
    await generateMutation.mutateAsync();
  };

  const handleMarkReviewed = () => {
    markReviewedMutation.mutate(activeSection);
  };

  const handleInsertSuggestion = (suggestion: AISuggestion) => {
    const textToInsert = suggestion.suggested_text || suggestion.description;
    const newContent = editedContent ? `${editedContent}\n\n${textToInsert}` : textToInsert;
    handleContentChange(newContent);
  };

  const handleFinalize = async (data: { delivery_method: string; pharmacist_signature: string; consent_confirmed: boolean }) => {
    await finalizeMutation.mutateAsync({
      delivery_method: data.delivery_method as 'email' | 'print' | 'both',
      pharmacist_signature: data.pharmacist_signature,
      consent_confirmed: data.consent_confirmed,
    });
    setShowFinalizeModal(false);
  };

  const handleReopen = async () => {
    await reopenMutation.mutateAsync();
  };

  const handleToggleConsent = () => {
    updateConsentMutation.mutate({ obtained: !consent?.obtained });
  };

  const handleSendEmail = async () => {
    try {
      await sendEmailMutation.mutateAsync({});
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  // Filter included suggestions
  const includedSuggestions = suggestions?.filter((s) => s.is_included_in_report && !s.is_dismissed) || [];

  // Calculate review progress
  const reviewedCount = Object.values(draft?.sections || {}).filter((s: any) => s.reviewed).length;
  const totalSections = sectionConfig.length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!draft) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Report Draft</h3>
        <p className="mt-2 text-muted-foreground">
          Generate a draft report based on the medications, clinical notes, and AI suggestions.
        </p>
        <Button onClick={handleGenerate} isLoading={generateMutation.isPending} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Draft
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[600px]">
      {/* Left Panel - Section Navigation */}
      <div className="col-span-3 border-r pr-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Report Sections</h3>
            <span className="text-xs text-muted-foreground">
              {reviewedCount}/{totalSections} reviewed
            </span>
          </div>

          {sectionConfig.map((section) => {
            const sectionData = draft.sections?.[section.key];
            const isActive = activeSection === section.key;
            const isReviewed = sectionData?.reviewed;

            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left rounded-lg p-3 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{section.label}</span>
                  <div className="flex items-center gap-1">
                    {isReviewed && <Check className="h-4 w-4 text-green-500" />}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} isLoading={generateMutation.isPending} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Draft
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const token = useAuthStore.getState().accessToken;
                const url = `${reportApi.getPreviewPdfUrl(reviewId)}?token=${token}`;
                window.open(url, '_blank');
              }}
            >
              <Eye className="mr-1 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={async () => {
                try {
                  const blob = await reportApi.downloadPdf(reviewId);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `MedReview_Report.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Failed to download PDF:', error);
                }
              }}
            >
              <Download className="mr-1 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Consent Toggle */}
          <Button
            variant={consent?.obtained ? 'primary' : 'outline'}
            size="sm"
            className="w-full"
            onClick={handleToggleConsent}
            disabled={draft?.is_finalized || updateConsentMutation.isPending}
          >
            <Check className="mr-1 h-4 w-4" />
            {consent?.obtained ? 'Consent Obtained' : 'Mark Consent Obtained'}
          </Button>

          {/* Finalize / Reopen Button */}
          {draft?.is_finalized ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleReopen}
                isLoading={reopenMutation.isPending}
              >
                <Unlock className="mr-1 h-4 w-4" />
                Reopen for Amendment
              </Button>
              <Button
                variant={emailSent ? 'outline' : 'primary'}
                size="sm"
                className="w-full"
                onClick={handleSendEmail}
                isLoading={sendEmailMutation.isPending}
                disabled={emailSent}
              >
                <Mail className="mr-1 h-4 w-4" />
                {emailSent ? 'Email Sent' : 'Send to GP'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={() => setShowFinalizeModal(true)}
            >
              <Lock className="mr-1 h-4 w-4" />
              Finalize Report
            </Button>
          )}
        </div>
      </div>

      {/* Middle Panel - Editor */}
      <div className="col-span-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">
              {sectionConfig.find((s) => s.key === activeSection)?.label}
            </h3>
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-600">Saving...</span>
            )}
          </div>
          <Button
            variant={currentSectionData?.reviewed ? 'primary' : 'outline'}
            size="sm"
            onClick={handleMarkReviewed}
            disabled={markReviewedMutation.isPending}
          >
            {currentSectionData?.reviewed ? (
              <>
                <Check className="mr-1 h-4 w-4" /> Reviewed
              </>
            ) : (
              'Mark as Reviewed'
            )}
          </Button>
        </div>

        <textarea
          value={editedContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter section content..."
        />
      </div>

      {/* Right Panel - AI Suggestions */}
      <div className="col-span-3 border-l pl-4 overflow-y-auto">
        <h3 className="font-semibold text-sm mb-4">Included Suggestions</h3>

        {includedSuggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No suggestions included. Go to the AI Summary tab to include suggestions.
          </p>
        ) : (
          <div className="space-y-3">
            {includedSuggestions.map((suggestion) => {
              const config = severityConfig[suggestion.severity];
              const Icon = config.icon;

              return (
                <Card key={suggestion.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      {suggestion.suggested_text && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {suggestion.suggested_text}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => handleInsertSuggestion(suggestion)}
                      >
                        <ClipboardCopy className="mr-1 h-3 w-3" />
                        Insert
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Finalize Modal */}
      <FinalizeModal
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        onFinalize={handleFinalize}
        isPending={finalizeMutation.isPending}
        reviewedCount={reviewedCount}
        totalSections={totalSections}
        hasConsent={consent?.obtained || false}
      />
    </div>
  );
}
