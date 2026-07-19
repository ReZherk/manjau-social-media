import { useQuery } from '@tanstack/react-query';
import { Users, Globe, FileText, Activity } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { timeAgo } from '@/shared/lib/utils';
import type { RecentActivityResponse } from '@/shared/types/api';

interface DashboardSummary {
  activeUsers: number;
  connectedSocialNetworks: number;
  publicationsThisMonth: number;
  activitiesToday: number;
  usersByRole: { role: string; label: string; count: number }[];
  platforms: { name: string; active: boolean }[];
  periodLabel: string;
}

function DashboardStatCard({ icon: Icon, iconBg, iconColor, value, label }: {
  icon: React.ElementType; iconBg: string; iconColor: string; value: number | string; label: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    </div>
  );
}

function RecentActivityItem({ actorName, actorInitials, description, occurredAt }: RecentActivityResponse) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-soft-pink text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {actorInitials || actorName?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text">
          <span className="font-medium">{actorName}</span>
          {' — '}
          {description}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{timeAgo(occurredAt)}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const summaryQuery = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard/summary');
      return res.data;
    },
  });

  const activitiesQuery = useQuery<RecentActivityResponse[]>({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard/recent-activities');
      return res.data;
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text">Panel de Administración</h1>
        <p className="text-sm text-text-muted mt-1">
          Resumen general del sistema · {summaryQuery.data?.periodLabel ?? 'Cargando...'}
        </p>
      </div>

      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (<LoadingSkeleton key={i} className="h-24" />))}
        </div>
      ) : summaryQuery.isError ? (
        <ErrorState onRetry={() => summaryQuery.refetch()} />
      ) : summaryQuery.data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardStatCard icon={Users} iconBg="bg-soft-pink" iconColor="text-primary" value={summaryQuery.data.activeUsers} label="Usuarios activos" />
          <DashboardStatCard icon={Globe} iconBg="bg-purple-soft" iconColor="text-purple" value={summaryQuery.data.connectedSocialNetworks} label="Redes conectadas" />
          <DashboardStatCard icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-500" value={summaryQuery.data.publicationsThisMonth} label="Publicaciones este mes" />
          <DashboardStatCard icon={Activity} iconBg="bg-success-soft" iconColor="text-success" value={summaryQuery.data.activitiesToday} label="Actividades hoy" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-lg font-semibold text-text mb-4">Actividad Reciente</h2>
          {activitiesQuery.isLoading ? (
            <LoadingSkeleton count={5} className="h-12" />
          ) : activitiesQuery.isError ? (
            <ErrorState onRetry={() => activitiesQuery.refetch()} />
          ) : !activitiesQuery.data?.length ? (
            <p className="text-sm text-text-muted">No hay actividades recientes</p>
          ) : (
            activitiesQuery.data?.map((activity, i) => <RecentActivityItem key={i} {...activity} />)
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-text mb-4">Usuarios por Rol</h2>
            {summaryQuery.isLoading ? (
              <LoadingSkeleton count={3} className="h-8" />
            ) : (
              <div className="space-y-3">
                {summaryQuery.data?.usersByRole.map((ur) => {
                  const badgeColors: Record<string, string> = {
                    ADMINISTRATOR: 'bg-soft-pink text-primary',
                    COMMUNITY_MANAGER: 'bg-purple-soft text-purple',
                    MARKETING_ANALYST: 'bg-success-soft text-success',
                  };
                  return (
                    <div key={ur.role} className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColors[ur.role] || ''}`}>{ur.label}</span>
                      <span className="text-lg font-semibold text-text">{ur.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-text mb-4">Plataformas</h2>
            {summaryQuery.isLoading ? (
              <LoadingSkeleton count={3} className="h-8" />
            ) : (
              <div className="space-y-3">
                {summaryQuery.data?.platforms.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <span className="text-sm text-text">{p.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.active ? 'bg-success-soft text-success' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
