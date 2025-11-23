import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatients, useCreatePatient } from '@/hooks/usePatients';
import { useGPs, useCreateGP } from '@/hooks/useGPs';
import { useCreateReview } from '@/hooks/useReviews';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Search, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Patient, GP } from '@/types';

type Step = 1 | 2;

const patientSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  sex: z.string().min(1, 'Sex is required'),
  address: z.string().optional(),
  medicare_number: z.string().optional(),
  residential_setting: z.string().default('home'),
});

const gpSchema = z.object({
  name: z.string().min(1, 'GP name is required'),
  practice_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

const reviewContextSchema = z.object({
  review_type: z.enum(['hmr', 'rmmr']),
  reason_for_referral: z.string().optional(),
  interview_date: z.string().optional(),
});

export function NewReviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedGP, setSelectedGP] = useState<GP | null>(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showNewGP, setShowNewGP] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [gpSearch, setGpSearch] = useState('');

  const { data: patients } = usePatients({ search: patientSearch });
  const { data: gps } = useGPs(gpSearch);
  const createPatient = useCreatePatient();
  const createGP = useCreateGP();
  const createReview = useCreateReview();

  const patientForm = useForm({ resolver: zodResolver(patientSchema) });
  const gpForm = useForm({ resolver: zodResolver(gpSchema) });
  const reviewForm = useForm({
    resolver: zodResolver(reviewContextSchema),
    defaultValues: { review_type: 'hmr' as const },
  });

  const handleCreatePatient = async (data: z.infer<typeof patientSchema>) => {
    const patient = await createPatient.mutateAsync(data);
    setSelectedPatient(patient);
    setShowNewPatient(false);
    patientForm.reset();
  };

  const handleCreateGP = async (data: z.infer<typeof gpSchema>) => {
    const gp = await createGP.mutateAsync(data);
    setSelectedGP(gp);
    setShowNewGP(false);
    gpForm.reset();
  };

  const handleSubmit = async (data: z.infer<typeof reviewContextSchema>) => {
    if (!selectedPatient || !selectedGP) return;

    const review = await createReview.mutateAsync({
      patient_id: selectedPatient.id,
      gp_id: selectedGP.id,
      ...data,
    });

    navigate(`/reviews/${review.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Review</h1>
          <p className="text-muted-foreground">
            Step {step} of 2: {step === 1 ? 'Select Patient' : 'Review Details'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select or Create Patient</CardTitle>
            <CardDescription>Search for an existing patient or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewPatient ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {patients?.items.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      DOB: {patient.date_of_birth} | {patient.residential_setting}
                    </p>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={() => setShowNewPatient(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Patient
                </Button>
              </>
            ) : (
              <form onSubmit={patientForm.handleSubmit(handleCreatePatient)} className="space-y-4">
                <Input
                  label="Full Name"
                  {...patientForm.register('full_name')}
                  error={patientForm.formState.errors.full_name?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    {...patientForm.register('date_of_birth')}
                    error={patientForm.formState.errors.date_of_birth?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Sex</label>
                    <select
                      {...patientForm.register('sex')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Residential Setting</label>
                  <select
                    {...patientForm.register('residential_setting')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="home">Home</option>
                    <option value="racf">Residential Aged Care (RACF)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewPatient(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createPatient.isPending}>
                    Create Patient
                  </Button>
                </div>
              </form>
            )}

            {selectedPatient && !showNewPatient && (
              <div className="pt-4 border-t">
                <Button onClick={() => setStep(2)} className="w-full">
                  Continue with {selectedPatient.full_name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>
              Patient: {selectedPatient?.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GP Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Referring GP</h3>
              {!showNewGP ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search GPs..."
                      value={gpSearch}
                      onChange={(e) => setGpSearch(e.target.value)}
                      className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm"
                    />
                  </div>

                  {gps?.map((gp) => (
                    <div
                      key={gp.id}
                      onClick={() => setSelectedGP(gp)}
                      className={`cursor-pointer rounded-lg border p-3 ${
                        selectedGP?.id === gp.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium">{gp.name}</p>
                      {gp.practice_name && (
                        <p className="text-sm text-muted-foreground">{gp.practice_name}</p>
                      )}
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => setShowNewGP(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New GP
                  </Button>
                </>
              ) : (
                <form onSubmit={gpForm.handleSubmit(handleCreateGP)} className="space-y-4">
                  <Input label="GP Name" {...gpForm.register('name')} />
                  <Input label="Practice Name" {...gpForm.register('practice_name')} />
                  <Input label="Email" type="email" {...gpForm.register('email')} />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowNewGP(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={createGP.isPending}>
                      Add GP
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Review Context */}
            <form onSubmit={reviewForm.handleSubmit(handleSubmit)} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Review Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="hmr"
                      {...reviewForm.register('review_type')}
                      className="h-4 w-4"
                    />
                    <span>HMR</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="rmmr"
                      {...reviewForm.register('review_type')}
                      className="h-4 w-4"
                    />
                    <span>RMMR</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason for Referral</label>
                <textarea
                  {...reviewForm.register('reason_for_referral')}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Polypharmacy, falls risk, medication adherence..."
                />
              </div>

              <Input
                label="Interview Date"
                type="date"
                {...reviewForm.register('interview_date')}
              />

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!selectedGP}
                  isLoading={createReview.isPending}
                >
                  Create Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
