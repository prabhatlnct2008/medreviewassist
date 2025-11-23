import { useState } from 'react';
import { useMedications } from '@/hooks/useReviews';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, MedicationCreate } from '@/api/reviews';
import { Button, Input, Card, Spinner } from '@/components/ui';
import { Plus, Trash2, Edit2, Check, X, ClipboardPaste } from 'lucide-react';
import { Medication } from '@/types';

interface MedicationsTabProps {
  reviewId: string;
  onSave?: () => void;
}

export function MedicationsTab({ reviewId, onSave }: MedicationsTabProps) {
  const queryClient = useQueryClient();
  const { data: medications, isLoading } = useMedications(reviewId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');

  const addMutation = useMutation({
    mutationFn: (data: MedicationCreate) => reviewsApi.addMedication(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', reviewId] });
      setShowAddForm(false);
      onSave?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicationCreate> }) =>
      reviewsApi.updateMedication(reviewId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', reviewId] });
      setEditingId(null);
      onSave?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.deleteMedication(reviewId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', reviewId] });
      onSave?.();
    },
  });

  const parseMutation = useMutation({
    mutationFn: (text: string) => reviewsApi.parseMedications(reviewId, text),
  });

  const bulkAddMutation = useMutation({
    mutationFn: (meds: MedicationCreate[]) => reviewsApi.addMedicationsBulk(reviewId, meds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', reviewId] });
      setShowBulkPaste(false);
      setBulkText('');
      onSave?.();
    },
  });

  const handleParseBulk = async () => {
    const parsed = await parseMutation.mutateAsync(bulkText);
    if (parsed.length > 0) {
      const meds: MedicationCreate[] = parsed.map((p: any) => ({
        drug_name: p.drug_name,
        strength: p.strength,
        frequency: p.frequency,
        route: p.route || 'oral',
      }));
      await bulkAddMutation.mutateAsync(meds);
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
    <div className="grid grid-cols-3 gap-6">
      {/* Medication List */}
      <div className="col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Current Medications</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkPaste(!showBulkPaste)}>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Bulk Paste
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
        </div>

        {showAddForm && (
          <MedicationForm
            onSubmit={(data) => addMutation.mutate(data)}
            onCancel={() => setShowAddForm(false)}
            isLoading={addMutation.isPending}
          />
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="p-3">Drug</th>
                  <th className="p-3">Strength</th>
                  <th className="p-3">Dose/Freq</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Indication</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medications?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No medications added yet
                    </td>
                  </tr>
                ) : (
                  medications?.map((med) =>
                    editingId === med.id ? (
                      <MedicationEditRow
                        key={med.id}
                        medication={med}
                        onSave={(data) => updateMutation.mutate({ id: med.id, data })}
                        onCancel={() => setEditingId(null)}
                        isLoading={updateMutation.isPending}
                      />
                    ) : (
                      <tr key={med.id} className={`border-b last:border-0 ${med.is_ceased ? 'opacity-50' : ''}`}>
                        <td className="p-3 font-medium">
                          {med.drug_name}
                          {med.is_ceased && <span className="ml-2 text-xs text-red-500">(Ceased)</span>}
                        </td>
                        <td className="p-3">{med.strength || '-'}</td>
                        <td className="p-3">{med.dose || med.frequency || '-'}</td>
                        <td className="p-3">{med.route}</td>
                        <td className="p-3">{med.indication || '-'}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(med.id)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(med.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Right Panel - Bulk Paste */}
      <div className="space-y-4">
        {showBulkPaste && (
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Bulk Paste Medications</h3>
            <p className="text-sm text-muted-foreground">
              Paste a list of medications (one per line) and we'll parse them for you.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Metformin 500mg BD&#10;Atorvastatin 20mg OD&#10;Lisinopril 10mg daily"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleParseBulk}
                isLoading={parseMutation.isPending || bulkAddMutation.isPending}
                disabled={!bulkText.trim()}
              >
                Parse & Add
              </Button>
              <Button variant="outline" onClick={() => setShowBulkPaste(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="font-medium mb-2">Quick Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enter one medication per line for bulk paste</li>
            <li>• Include strength and frequency when possible</li>
            <li>• Mark ceased medications to track history</li>
            <li>• Add indications for better AI analysis</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function MedicationForm({
  onSubmit,
  onCancel,
  isLoading,
  defaultValues,
}: {
  onSubmit: (data: MedicationCreate) => void;
  onCancel: () => void;
  isLoading: boolean;
  defaultValues?: Partial<MedicationCreate>;
}) {
  const [formData, setFormData] = useState<MedicationCreate>({
    drug_name: defaultValues?.drug_name || '',
    strength: defaultValues?.strength || '',
    dose: defaultValues?.dose || '',
    frequency: defaultValues?.frequency || '',
    route: defaultValues?.route || 'oral',
    indication: defaultValues?.indication || '',
    is_ceased: defaultValues?.is_ceased || false,
  });

  return (
    <Card className="p-4">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2">
          <Input
            label="Drug Name"
            value={formData.drug_name}
            onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
            required
          />
        </div>
        <Input
          label="Strength"
          value={formData.strength}
          onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
        />
        <Input
          label="Dose"
          value={formData.dose}
          onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
        />
        <Input
          label="Frequency"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium mb-1">Route</label>
          <select
            value={formData.route}
            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="oral">Oral</option>
            <option value="topical">Topical</option>
            <option value="injection">Injection</option>
            <option value="inhalation">Inhalation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Input
          label="Indication"
          value={formData.indication}
          onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_ceased}
              onChange={(e) => setFormData({ ...formData, is_ceased: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Mark as ceased</span>
          </label>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onSubmit(formData)} isLoading={isLoading} disabled={!formData.drug_name}>
          <Check className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function MedicationEditRow({
  medication,
  onSave,
  onCancel,
  isLoading,
}: {
  medication: Medication;
  onSave: (data: Partial<MedicationCreate>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    drug_name: medication.drug_name,
    strength: medication.strength || '',
    dose: medication.dose || '',
    frequency: medication.frequency || '',
    route: medication.route,
    indication: medication.indication || '',
    is_ceased: medication.is_ceased,
  });

  return (
    <tr className="border-b bg-gray-50">
      <td className="p-2">
        <input
          type="text"
          value={formData.drug_name}
          onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </td>
      <td className="p-2">
        <input
          type="text"
          value={formData.strength}
          onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </td>
      <td className="p-2">
        <input
          type="text"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </td>
      <td className="p-2">
        <select
          value={formData.route}
          onChange={(e) => setFormData({ ...formData, route: e.target.value })}
          className="w-full rounded border px-2 py-1 text-sm"
        >
          <option value="oral">oral</option>
          <option value="topical">topical</option>
          <option value="injection">injection</option>
          <option value="inhalation">inhalation</option>
        </select>
      </td>
      <td className="p-2">
        <input
          type="text"
          value={formData.indication}
          onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </td>
      <td className="p-2">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onSave(formData)} disabled={isLoading}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
