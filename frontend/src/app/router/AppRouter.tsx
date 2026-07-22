import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/app/permissions/ProtectedRoute';
import { GuestRoute } from '@/app/permissions/GuestRoute';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';

const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const ChangePasswordPage = lazy(() => import('@/modules/auth/pages/ChangePasswordPage'));
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
const CommunityDashboardPage = lazy(() => import('@/modules/dashboard/pages/CommunityDashboardPage'));
const AnalystDashboardPage = lazy(() => import('@/modules/dashboard/pages/AnalystDashboardPage'));
const UsersPage = lazy(() => import('@/modules/users/pages/UsersPage'));
const AuditPage = lazy(() => import('@/modules/audit/pages/AuditPage'));
const SocialAccountsPage = lazy(() => import('@/modules/social-accounts/pages/SocialAccountsPage'));
const NewPublicationPage = lazy(() => import('@/modules/publications/pages/NewPublicationPage'));
const ScheduledPublicationsPage = lazy(() => import('@/modules/publications/pages/ScheduledPublicationsPage'));
const HistoryPage = lazy(() => import('@/modules/publications/pages/HistoryPage'));
const MetricsPage = lazy(() => import('@/modules/metrics/pages/MetricsPage'));
const KpisPage = lazy(() => import('@/modules/kpis/pages/KpisPage'));
const ReportsPage = lazy(() => import('@/modules/reports/pages/ReportsPage'));
const NotFoundPage = lazy(() => import('@/shared/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/shared/pages/UnauthorizedPage'));

function PageLoader() {
  return (
    <div className="p-8">
      <LoadingSkeleton count={6} className="h-8 w-full" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard" element={<CommunityDashboardPage />} />
              <Route path="/analyst/dashboard" element={<AnalystDashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/audit" element={<AuditPage />} />
              <Route path="/social-accounts" element={<SocialAccountsPage />} />
              <Route path="/publications/new" element={<NewPublicationPage />} />
              <Route path="/publications/scheduled" element={<ScheduledPublicationsPage />} />
              <Route path="/publications/history" element={<HistoryPage />} />
              <Route path="/metrics/register" element={<MetricsPage />} />
              <Route path="/kpis" element={<KpisPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          <Route path="/401" element={<UnauthorizedPage />} />
          <Route path="/403" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
