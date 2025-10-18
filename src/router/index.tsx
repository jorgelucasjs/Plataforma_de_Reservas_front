import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { LoadingSpinner } from '@/ui/components/LoadingSpinner';

// Lazy load layouts
const AppLayout = lazy(() => import('@/ui/layouts/AppLayout').then(module => ({ default: module.AppLayout })));
const AuthLayout = lazy(() => import('@/ui/layouts/AuthLayout').then(module => ({ default: module.AuthLayout })));

// Lazy load pages
const LoginPage = lazy(() => import('@/ui/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/ui/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('@/ui/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ServicesPage = lazy(() => import('@/ui/pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const BookingsPage = lazy(() => import('@/ui/pages/BookingsPage').then(module => ({ default: module.BookingsPage })));
const TransactionHistoryPage = lazy(() => import('@/ui/pages/TransactionHistoryPage').then(module => ({ default: module.TransactionHistoryPage })));
const ProfilePage = lazy(() => import('@/ui/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

// Wrapper component for lazy loaded components with loading fallback
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner size="lg" />}>
    {children}
  </Suspense>
);


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/auth',
        element: (
            <LazyWrapper>
                <AuthLayout />
            </LazyWrapper>
        ),
        children: [
            {
                path: 'login',
                element: (
                    <LazyWrapper>
                        <LoginPage />
                    </LazyWrapper>
                ),
            },
            {
                path: 'register',
                element: (
                    <LazyWrapper>
                        <RegisterPage />
                    </LazyWrapper>
                ),
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
                <LazyWrapper>
                    <AppLayout />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: (
                    <LazyWrapper>
                        <DashboardPage />
                    </LazyWrapper>
                ),
            },
            {
                path: 'services',
                element: (
                    <RoleBasedRoute allowedRoles={['client', 'provider']}>
                        <LazyWrapper>
                            <ServicesPage />
                        </LazyWrapper>
                    </RoleBasedRoute>
                ),
            },
            {
                path: 'bookings',
                element: (
                    <LazyWrapper>
                        <BookingsPage />
                    </LazyWrapper>
                ),
            },
            {
                path: 'transactions',
                element: (
                    <LazyWrapper>
                        <TransactionHistoryPage />
                    </LazyWrapper>
                ),
            },
            {
                path: 'profile',
                element: (
                    <LazyWrapper>
                        <ProfilePage />
                    </LazyWrapper>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
]);