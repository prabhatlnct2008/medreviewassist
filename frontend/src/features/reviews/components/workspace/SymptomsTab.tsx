import { useState, useEffect, useCallback } from 'react';
import { useClinicalNotes } from '@/hooks/useReviews';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, ClinicalNoteUpdate } from '@/api/reviews';
import { Card, Spinner } from '@/components/ui';
import { ClinicalNoteSection } from '@/types';
import { CheckCircle } from 'lucide-react';
import { debounce } from '@/utils/debounce';

interface SymptomsTabProps {
  reviewId: string;
  onSave?: () => void;
}

const sections: { id: ClinicalNoteSection; label: string; placeholder: string }[] = [
  {
    id: ClinicalNoteSection.PRESENTING_ISSUES,
    label: 'Presenting Issues / Symptoms',
    placeholder: 'Describe the main presenting issues and symptoms...',
  },
  {
    id: ClinicalNoteSection.MEDICAL_HISTORY,
    label: 'Past Medical History',
    placeholder: 'List relevant past medical history, diagnoses, surgeries...',
  },
  {
    id: ClinicalNoteSection.ALLERGIES,
    label: 'Allergies & Adverse Reactions',
    placeholder: 'Document known allergies and adverse drug reactions...',
  },
  {
    id: ClinicalNoteSection.ADHERENCE_LIFESTYLE,
    label: 'Adherence & Lifestyle Notes',
    placeholder: 'Note medication adherence, lifestyle factors, diet, exercise...',
  },
  {
    id: ClinicalNoteSection.PATIENT_GOALS,
    label: 'Patient Goals & Concerns',
    placeholder: 'Document patient-expressed goals and concerns...',
  },
];

export function SymptomsTab({ reviewId, onSave }: SymptomsTabProps) {
  const queryClient = useQueryClient();
  const { data: notes, isLoading } = useClinicalNotes(reviewId);
  const [localNotes, setLocalNotes] = useState<Record<string, { content: string; is_key_point: boolean }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Initialize local state when notes load
  useEffect(() => {
    if (notes) {
      const noteMap: Record<string, { content: string; is_key_point: boolean }> = {};
      notes.forEach((note) => {
        noteMap[note.section_type] = {
          content: note.content || '',
          is_key_point: note.is_key_point,
        };
      });
      setLocalNotes(noteMap);
    }
  }, [notes]);

  const updateMutation = useMutation({
    mutationFn: ({ section, data }: { section: string; data: ClinicalNoteUpdate }) =>
      reviewsApi.updateClinicalNote(reviewId, section, data),
    onSuccess: (_, { section }) => {
      queryClient.invalidateQueries({ queryKey: ['clinicalNotes', reviewId] });
      setSaving((prev) => ({ ...prev, [section]: false }));
      onSave?.();
    },
    onError: (_, { section }) => {
      setSaving((prev) => ({ ...prev, [section]: false }));
    },
  });

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((section: string, data: ClinicalNoteUpdate) => {
      setSaving((prev) => ({ ...prev, [section]: true }));
      updateMutation.mutate({ section, data });
    }, 1000),
    [reviewId]
  );

  const handleChange = (section: ClinicalNoteSection, field: 'content' | 'is_key_point', value: string | boolean) => {
    const current = localNotes[section] || { content: '', is_key_point: false };
    const updated = { ...current, [field]: value };
    setLocalNotes((prev) => ({ ...prev, [section]: updated }));
    debouncedSave(section, updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clinical Notes</h2>
        <p className="text-sm text-muted-foreground">Changes are saved automatically</p>
      </div>

      {sections.map((section) => {
        const note = localNotes[section.id] || { content: '', is_key_point: false };
        const isSaving = saving[section.id];

        return (
          <Card key={section.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">{section.label}</label>
              <div className="flex items-center gap-3">
                {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
                {!isSaving && note.content && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Saved
                  </span>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={note.is_key_point}
                    onChange={(e) => handleChange(section.id, 'is_key_point', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  Mark as key point
                </label>
              </div>
            </div>
            <textarea
              value={note.content}
              onChange={(e) => handleChange(section.id, 'content', e.target.value)}
              placeholder={section.placeholder}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Card>
        );
      })}
    </div>
  );
}
