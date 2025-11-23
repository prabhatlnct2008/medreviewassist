import { useAuditLogs } from '@/hooks/useAudit';
import { Card, Spinner } from '@/components/ui';
import { Clock, FileText, Brain, Edit, CheckCircle, RotateCcw, Send, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewHistoryPanelProps {
  reviewId: string;
}

const actionConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  created: { icon: Plus, color: 'text-green-600', label: 'Created' },
  updated: { icon: Edit, color: 'text-blue-600', label: 'Updated' },
  medications_added: { icon: Plus, color: 'text-purple-600', label: 'Medications Added' },
  ai_generated: { icon: Brain, color: 'text-indigo-600', label: 'AI Generated' },
  draft_generated: { icon: FileText, color: 'text-blue-600', label: 'Draft Generated' },
  edited: { icon: Edit, color: 'text-gray-600', label: 'Edited' },
  finalized: { icon: CheckCircle, color: 'text-green-600', label: 'Finalized' },
  reopened: { icon: RotateCcw, color: 'text-yellow-600', label: 'Reopened' },
  exported: { icon: Send, color: 'text-blue-600', label: 'Exported' },
};

export function ReviewHistoryPanel({ reviewId }: ReviewHistoryPanelProps) {
  const { data: logs, isLoading } = useAuditLogs(reviewId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <Clock className="mx-auto h-8 w-8 mb-2" />
        <p className="text-sm">No activity history yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Activity History</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {logs.map((log) => {
            const config = actionConfig[log.action] || {
              icon: Clock,
              color: 'text-gray-500',
              label: log.action,
            };
            const Icon = config.icon;

            return (
              <div key={log.id} className="relative pl-10">
                {/* Icon on timeline */}
                <div className={`absolute left-2 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center ${config.color.replace('text-', 'border-')}`}>
                  <Icon className={`h-3 w-3 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      {log.details?.event && (
                        <p className="text-xs text-muted-foreground">{String(log.details.event)}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'dd/MM HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">by {log.user_name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
