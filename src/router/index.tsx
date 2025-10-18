import { AppLayout } from '@/ui/layouts/AppLayout';
import { AuthLayout } from '@/ui/layouts/AuthLayout';
import { BookingsPage } from '@/ui/pages/BookingsPage';
import { DashboardPage } from '@/ui/pages/DashboardPage';
import { LoginPage } from '@/ui/pages/LoginPage';
import { ProfilePage } from '@/ui/pages/ProfilePage';
import { RegisterPage } from '@/ui/pages/RegisterPage';
import { TransactionHistoryPage } from '@/ui/pages/TransactionHistoryPage';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { ServicesPage } from '@/ui/pages/ServicesPage';


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