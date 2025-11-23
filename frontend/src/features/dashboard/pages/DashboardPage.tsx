import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviews } from '@/hooks/useReviews';
import { Button, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { Plus, Search, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ReviewStatus, ReviewType } from '@/types';

const statusColors: Record<ReviewStatus, string> = {
  [ReviewStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [ReviewStatus.AWAITING_GP]: 'bg-blue-100 text-blue-800',
  [ReviewStatus.SUBMITTED]: 'bg-green-100 text-green-800',
  [ReviewStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [reviewType, setReviewType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useReviews({
    search: search || undefined,
    review_type: reviewType || undefined,
    status: status || undefined,
    page,
    page_size: 20,
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.first_name}</p>
        </div>
        <Link to="/reviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient, GP, or review ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="hmr">HMR</option>
              <option value="rmmr">RMMR</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first medication review
              </p>
              <Link to="/reviews/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Review
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">GP</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((review) => (
                    <tr key={review.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{review.patient_name}</td>
                      <td className="py-3 uppercase">{review.review_type}</td>
                      <td className="py-3">{review.gp_name}</td>
                      <td className="py-3">{formatDate(review.created_at)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[review.status]
                          }`}
                        >
                          {review.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          to={`/reviews/${review.id}`}
                          className="text-primary hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data && data.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
