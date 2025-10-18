import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../ui/layouts/AuthLayout';
import { AppLayout } from '../ui/layouts/AppLayout';
import { LoginPage } from '../ui/pages/LoginPage';
import { RegisterPage } from '../ui/pages/RegisterPage';
import { DashboardPage } from '../ui/pages/DashboardPage';
import { ServicesPage } from '../ui/pages/ServicesPage';
import { BookingsPage } from '../ui/pages/BookingsPage';
import { TransactionHistoryPage } from '../ui/pages/TransactionHistoryPage';
import { ProfilePage } from '../ui/pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'services',
        element: (
          <RoleBasedRoute allowedRoles={['client', 'provider']}>
            <ServicesPage />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'transactions',
        element: <TransactionHistoryPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);