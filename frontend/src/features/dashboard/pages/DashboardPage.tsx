import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Plus, Search, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name}
          </p>
        </div>
        <Link to="/reviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient, GP, or review ID..."
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="hmr">HMR</option>
              <option value="rmmr">RMMR</option>
            </select>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
