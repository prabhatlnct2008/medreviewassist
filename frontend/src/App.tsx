import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoadingScreen } from '@/components/ui';

// Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { fetchCurrentUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading && !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Onboarding - requires auth but not onboarding completion */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarding={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<div>Patients Page (Coming Soon)</div>} />
        <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
