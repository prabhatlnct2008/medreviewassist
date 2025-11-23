import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, Check, X } from 'lucide-react';

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (data: { delivery_method: string; pharmacist_signature: string; consent_confirmed: boolean }) => void;
  isPending: boolean;
  reviewedCount: number;
  totalSections: number;
  hasConsent: boolean;
}

export function FinalizeModal({
  isOpen,
  onClose,
  onFinalize,
  isPending,
  reviewedCount,
  totalSections,
  hasConsent,
}: FinalizeModalProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'print' | 'both'>('email');
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const allSectionsReviewed = reviewedCount === totalSections;
  const canFinalize = allSectionsReviewed && hasConsent && confirmed;

  const handleSubmit = () => {
    if (!canFinalize) return;
    onFinalize({
      delivery_method: deliveryMethod,
      pharmacist_signature: signature,
      consent_confirmed: confirmed,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Finalize Report</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Checklist */}
        <div className="space-y-4 mb-6">
          <h3 className="font-medium">Pre-submission Checklist</h3>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${allSectionsReviewed ? 'bg-green-50' : 'bg-yellow-50'}`}>
            {allSectionsReviewed ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="text-sm">
              {allSectionsReviewed
                ? 'All sections reviewed'
                : `${reviewedCount}/${totalSections} sections reviewed`}
            </span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${hasConsent ? 'bg-green-50' : 'bg-red-50'}`}>
            {hasConsent ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm">
              {hasConsent ? 'Patient consent obtained' : 'Patient consent required'}
            </span>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Delivery Method</label>
          <div className="flex gap-4">
            {(['email', 'print', 'both'] as const).map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  value={method}
                  checked={deliveryMethod === method}
                  onChange={() => setDeliveryMethod(method)}
                  className="h-4 w-4"
                />
                <span className="text-sm capitalize">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Digital Signature (Optional)</label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Type your name to sign"
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
          />
        </div>

        {/* Confirmation */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded"
            />
            <span className="text-sm">
              I confirm that I have reviewed all sections of this report and that the information is accurate to the best of my knowledge.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canFinalize}
            isLoading={isPending}
            className="flex-1"
          >
            <Check className="mr-2 h-4 w-4" />
            Finalize Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
