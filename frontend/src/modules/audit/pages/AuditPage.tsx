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

interface AuditPageResponse {
  content: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const actionOptions = [
  { value: 'LOGIN_SUCCEEDED', label: 'Inicio de sesión' },
  { value: 'LOGIN_FAILED', label: 'Inicio fallido' },
  { value: 'USER_CREATED', label: 'Usuario creado' },
  { value: 'USER_UPDATED', label: 'Usuario actualizado' },
  { value: 'USER_ACTIVATED', label: 'Usuario activado' },
  { value: 'USER_DEACTIVATED', label: 'Usuario desactivado' },
  { value: 'USER_CREDENTIALS_RESET', label: 'Credenciales restablecidas' },
  { value: 'PASSWORD_CHANGED', label: 'Contraseña cambiada' },
];

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<AuditPageResponse>({
    queryKey: ['audit-logs', search, action, page],
    queryFn: async () => {
      const res = await apiClient.get('/audit-logs', {
        params: { search: search || undefined, action: action || undefined, page, size: 10 },
      });
      return res.data;
    },
  });

  return (
    <div>
      <PageHeader title="Auditoría" subtitle="Consulta las actividades realizadas dentro del sistema" />

      <div className="card p-4 mb-6 space-y-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Buscar por usuario o acción..." />
        <div className="flex gap-3">
          <FilterSelect value={action} onChange={(v) => { setAction(v); setPage(0); }} options={actionOptions} placeholder="Todas las acciones" />
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
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
