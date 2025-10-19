import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserType } from '../types/auth';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserType[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleBasedRouteProps) {
  const { user, isAuthenticated, isInitialized } = useAuth();

  // If not initialized yet, let ProtectedRoute handle the loading state
  if (!isInitialized) {
    return null; // ProtectedRoute will show loading
  }

  // If not authenticated, this should be handled by ProtectedRoute
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.userType)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}