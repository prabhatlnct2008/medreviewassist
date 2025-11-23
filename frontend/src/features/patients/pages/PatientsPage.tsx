import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { Button, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import { Plus, Search, Users } from 'lucide-react';
import { format } from 'date-fns';

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePatients({ search, page, page_size: 20 });

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
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Link to="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients by name or Medicare number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No patients yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first patient to get started
              </p>
              <Link to="/patients/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">DOB</th>
                    <th className="pb-3">Sex</th>
                    <th className="pb-3">Setting</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((patient) => (
                    <tr key={patient.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{patient.full_name}</td>
                      <td className="py-3">{formatDate(patient.date_of_birth)}</td>
                      <td className="py-3 capitalize">{patient.sex}</td>
                      <td className="py-3 capitalize">{patient.residential_setting}</td>
                      <td className="py-3">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-primary hover:underline"
                        >
                          View
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
