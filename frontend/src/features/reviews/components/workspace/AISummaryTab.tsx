import { useState } from 'react';
import { useAISuggestions, useGenerateAISuggestions, useUpdateAISuggestion } from '@/hooks/useAISuggestions';
import { Button, Card, Spinner } from '@/components/ui';
import { Brain, AlertTriangle, AlertCircle, Info, Check, X, RefreshCw, ClipboardCopy } from 'lucide-react';
import { AISuggestion, SuggestionSeverity, SuggestionCategory } from '@/types';

interface AISummaryTabProps {
  reviewId: string;
  onInsertToReport?: (text: string) => void;
}

const severityConfig: Record<SuggestionSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  [SuggestionSeverity.HIGH]: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  [SuggestionSeverity.MODERATE]: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  [SuggestionSeverity.INFO]: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

const categoryLabels: Record<SuggestionCategory, string> = {
  [SuggestionCategory.INTERACTION]: 'Drug Interaction',
  [SuggestionCategory.DOSING]: 'Dosing Concern',
  [SuggestionCategory.DEPRESCRIBING]: 'Deprescribing',
  [SuggestionCategory.ADHERENCE]: 'Adherence',
  [SuggestionCategory.MONITORING]: 'Monitoring',
  [SuggestionCategory.OTHER]: 'Other',
};

export function AISummaryTab({ reviewId, onInsertToReport }: AISummaryTabProps) {
  const { data: suggestions, isLoading } = useAISuggestions(reviewId);
  const generateMutation = useGenerateAISuggestions(reviewId);
  const updateMutation = useUpdateAISuggestion(reviewId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSuggestion = suggestions?.find((s) => s.id === selectedId);

  const handleGenerate = async () => {
    await generateMutation.mutateAsync();
  };

  const handleToggleInclude = (suggestion: AISuggestion) => {
    updateMutation.mutate({
      suggestionId: suggestion.id,
      data: { is_included_in_report: !suggestion.is_included_in_report },
    });
  };

  const handleDismiss = (suggestion: AISuggestion) => {
    updateMutation.mutate({
      suggestionId: suggestion.id,
      data: { is_dismissed: true },
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const activeSuggestions = suggestions?.filter((s) => !s.is_dismissed) || [];
  const dismissedSuggestions = suggestions?.filter((s) => s.is_dismissed) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900">Decision Support Only</p>
            <p className="text-sm text-blue-700">
              You are the final clinical decision-maker. Review all suggestions carefully before including them in your report.
            </p>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Clinical Suggestions</h2>
        <Button onClick={handleGenerate} isLoading={generateMutation.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {suggestions?.length ? 'Regenerate' : 'Generate'} Suggestions
        </Button>
      </div>

      {activeSuggestions.length === 0 && !generateMutation.isPending ? (
        <Card className="p-8 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Suggestions Yet</h3>
          <p className="mt-2 text-muted-foreground">
            Click "Generate Suggestions" to analyze the medication list and clinical notes.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Suggestions List */}
          <div className="col-span-1 space-y-2">
            {activeSuggestions.map((suggestion) => {
              const config = severityConfig[suggestion.severity];
              const Icon = config.icon;

              return (
                <div
                  key={suggestion.id}
                  onClick={() => setSelectedId(suggestion.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedId === suggestion.id
                      ? 'border-primary bg-primary/5'
                      : `${config.bg} hover:border-gray-300`
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{categoryLabels[suggestion.category]}</p>
                    </div>
                    {suggestion.is_included_in_report && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              );
            })}

            {dismissedSuggestions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Dismissed ({dismissedSuggestions.length})
                </p>
                {dismissedSuggestions.map((s) => (
                  <div key={s.id} className="text-xs text-muted-foreground py-1 line-through">
                    {s.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Suggestion Detail */}
          <div className="col-span-2">
            {selectedSuggestion ? (
              <Card className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const config = severityConfig[selectedSuggestion.severity];
                        const Icon = config.icon;
                        return <Icon className={`h-5 w-5 ${config.color}`} />;
                      })()}
                      <h3 className="text-lg font-semibold">{selectedSuggestion.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {categoryLabels[selectedSuggestion.category]} • {selectedSuggestion.severity.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedSuggestion.is_included_in_report ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleInclude(selectedSuggestion)}
                    >
                      {selectedSuggestion.is_included_in_report ? (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Included
                        </>
                      ) : (
                        'Include in Report'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(selectedSuggestion)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm">{selectedSuggestion.description}</p>
                </div>

                {selectedSuggestion.involved_medications && selectedSuggestion.involved_medications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Involved Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSuggestion.involved_medications.map((med, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSuggestion.clinical_rationale && (
                  <div>
                    <h4 className="font-medium mb-1">Clinical Rationale</h4>
                    <p className="text-sm">{selectedSuggestion.clinical_rationale}</p>
                  </div>
                )}

                {selectedSuggestion.evidence_summary && (
                  <div>
                    <h4 className="font-medium mb-1">Evidence Summary</h4>
                    <p className="text-sm">{selectedSuggestion.evidence_summary}</p>
                  </div>
                )}

                {selectedSuggestion.suggested_text && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Suggested Report Text</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(selectedSuggestion.suggested_text!)}
                      >
                        <ClipboardCopy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm italic">{selectedSuggestion.suggested_text}</p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a suggestion to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
