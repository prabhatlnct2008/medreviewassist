import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If onboarding is required and not completed, redirect to onboarding
  if (requireOnboarding && user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
