import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, completeOnboarding, isLoading } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    ahpra_number: user?.ahpra_number || '',
    conducts_hmr: true,
    conducts_rmmr: true,
    organisation_name: user?.organisation_name || '',
    compliance_acknowledged: false,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <CardTitle>
            {step === 1 && 'Professional Details'}
            {step === 2 && 'Organisation Context'}
            {step === 3 && 'Compliance Information'}
            {step === 4 && 'Welcome to MedReview Assist'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Confirm your professional information'}
            {step === 2 && 'Tell us about your practice (optional)'}
            {step === 3 && 'Important information about data and compliance'}
            {step === 4 && 'Here\'s how it works'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
              </div>
              <Input
                label="AHPRA Registration Number"
                value={formData.ahpra_number}
                onChange={(e) => setFormData({ ...formData, ahpra_number: e.target.value })}
                placeholder="PHA0001234567"
              />
              <div>
                <p className="mb-2 text-sm font-medium">I conduct:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.conducts_hmr}
                      onChange={(e) => setFormData({ ...formData, conducts_hmr: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Home Medicines Reviews (HMR)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.conducts_rmmr}
                      onChange={(e) => setFormData({ ...formData, conducts_rmmr: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Residential Medication Management Reviews (RMMR)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Organisation / Practice Name"
                value={formData.organisation_name}
                onChange={(e) => setFormData({ ...formData, organisation_name: e.target.value })}
                placeholder="Your practice or organisation"
                helperText="This will appear in your reports"
              />
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-4 rounded-lg bg-blue-50 p-4 text-sm">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p>Your data is hosted securely in Australia</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p>Health information is treated as sensitive under the Australian Privacy Act</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p>This system provides clinical decision support only - you remain the decision-maker</p>
                </div>
              </div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.compliance_acknowledged}
                  onChange={(e) => setFormData({ ...formData, compliance_acknowledged: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">I have read and understood this information</span>
              </label>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">1</div>
                  <div>
                    <p className="font-medium">Create a New Review</p>
                    <p className="text-sm text-muted-foreground">Start an HMR or RMMR for a patient</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">2</div>
                  <div>
                    <p className="font-medium">Enter Medications & Notes</p>
                    <p className="text-sm text-muted-foreground">Type, paste, scan, or dictate the medication list</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">3</div>
                  <div>
                    <p className="font-medium">Review AI Suggestions</p>
                    <p className="text-sm text-muted-foreground">Get evidence-based clinical insights</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">4</div>
                  <div>
                    <p className="font-medium">Edit & Export Report</p>
                    <p className="text-sm text-muted-foreground">Finalize and send to the GP</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={step === 3 && !formData.compliance_acknowledged}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1" isLoading={isLoading}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
