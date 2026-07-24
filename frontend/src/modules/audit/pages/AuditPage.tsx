import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchInput } from '@/shared/components/SearchInput';
import { FilterSelect } from '@/shared/components/FilterSelect';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { formatDateTime } from '@/shared/lib/utils';
import type { PageResponse } from '@/shared/types/api';
import { useRoles } from '@/modules/users/hooks/useRoles';

interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  actionLabel: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  occurredAt: string;
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const rolesQuery = useRoles();
  const actionsQuery = useQuery<Array<{ code: string; name: string }>>({
    queryKey: ['audit-actions'],
    queryFn: async () => (await apiClient.get('/audit-logs/actions')).data,
  });
  const actionOptions = (actionsQuery.data ?? []).map((item) => ({ value: item.code, label: item.name }));
  const roleOptions = (rolesQuery.data?.data ?? []).map((item) => ({ value: item.code, label: item.name }));

  const { data, isLoading, isError, refetch } = useQuery<PageResponse<AuditLog>>({
    queryKey: ['audit-logs', search, action, role, from, to, page],
    queryFn: async () => {
      const res = await apiClient.get('/audit-logs', {
        params: {
          search: search || undefined,
          action: action || undefined,
          role: role || undefined,
          from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
          to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
          page: Number.isInteger(page) && page >= 0 ? page : 0,
          size: 10,
        },
      });
      return res.data;
    },
  });

  return (
    <div>
      <PageHeader title="Auditoría" subtitle="Consulta las actividades realizadas dentro del sistema" />

      <div className="card p-4 mb-6 space-y-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Buscar por usuario o acción..." />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <FilterSelect value={action} onChange={(v) => { setAction(v); setPage(0); }} options={actionOptions} placeholder="Todas las acciones" />
          <FilterSelect value={role} onChange={(v) => { setRole(v); setPage(0); }} options={roleOptions} placeholder="Todos los roles" />
          <label className="text-xs text-text-muted">Desde<input type="date" className="input-field mt-1" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} /></label>
          <label className="text-xs text-text-muted">Hasta<input type="date" className="input-field mt-1" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} /></label>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6"><LoadingSkeleton count={8} className="h-10" /></div>
        ) : isError ? (
          <div className="p-6"><ErrorState onRetry={() => refetch()} /></div>
        ) : !data?.content?.length ? (
          <EmptyState />
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Usuario</th>
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Rol</th>
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Acción</th>
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Recurso</th>
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Fecha</th>
                    <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((log) => (
                    <tr key={log.id} className="border-b border-border">
                      <td className="py-3 text-sm font-medium text-text">{log.actorName}</td>
                      <td className="py-3 text-sm text-text-muted">{log.actorRole}</td>
                      <td className="py-3">
                        <span className="text-xs bg-soft-pink text-primary px-2.5 py-1 rounded-full">
                          {log.actionLabel || log.action}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-text-muted">{log.entityType || '-'}</td>
                      <td className="py-3 text-sm text-text-muted">{formatDateTime(log.occurredAt)}</td>
                      <td className="py-3 text-sm text-text-muted font-mono text-xs">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={(nextPage) => setPage(Number.isInteger(nextPage) && nextPage >= 0 ? nextPage : 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
