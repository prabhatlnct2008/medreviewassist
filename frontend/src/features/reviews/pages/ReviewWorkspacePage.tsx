import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReview } from '@/hooks/useReviews';
import { Button, Card, Spinner } from '@/components/ui';
import { ArrowLeft, Pill, FileText, Brain, ClipboardList, Save } from 'lucide-react';
import { MedicationsTab } from '../components/workspace/MedicationsTab';
import { SymptomsTab } from '../components/workspace/SymptomsTab';
import { AISummaryTab } from '../components/workspace/AISummaryTab';
import { format } from 'date-fns';

type TabId = 'medications' | 'symptoms' | 'ai-summary' | 'report';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'symptoms', label: 'Symptoms & History', icon: ClipboardList },
  { id: 'ai-summary', label: 'AI Summary', icon: Brain },
  { id: 'report', label: 'Report Draft', icon: FileText },
];

export function ReviewWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: review, isLoading, error } = useReview(id!);
  const [activeTab, setActiveTab] = useState<TabId>('medications');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Review not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{review.patient.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {review.review_type.toUpperCase()} | GP: {review.gp.name}
              {review.interview_date && ` | Interview: ${formatDate(review.interview_date)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              <Save className="inline h-3 w-3 mr-1" />
              Saved {format(lastSaved, 'HH:mm')}
            </span>
          )}
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              review.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : review.status === 'submitted'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {review.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'medications' && (
          <MedicationsTab reviewId={review.id} onSave={() => setLastSaved(new Date())} />
        )}
        {activeTab === 'symptoms' && (
          <SymptomsTab reviewId={review.id} onSave={() => setLastSaved(new Date())} />
        )}
        {activeTab === 'ai-summary' && (
          <AISummaryTab reviewId={review.id} />
        )}
        {activeTab === 'report' && (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Report Draft</h3>
            <p className="mt-2 text-muted-foreground">Coming in Phase 9</p>
          </Card>
        )}
      </div>
    </div>
  );
}
