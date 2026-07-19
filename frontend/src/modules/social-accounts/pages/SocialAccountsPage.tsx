import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchInput } from '@/shared/components/SearchInput';
import { FilterSelect } from '@/shared/components/FilterSelect';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { PermissionGuard } from '@/app/permissions/PermissionGuard';
import { PERMISSIONS } from '@/app/permissions/permissions';
import { useSocialAccounts } from '../hooks/useSocialAccounts';
import { socialAccountsApi } from '../api/socialAccountsApi';
import { SocialAccountCard } from '../components/SocialAccountCard';
import { SocialAccountFormDialog } from '../components/SocialAccountFormDialog';
import type { SocialAccountResponse, SocialAccountFilters } from '../types/socialAccountTypes';
import type { EditSocialAccountFormData } from '../schemas/socialAccountSchemas';

const PLATFORM_OPTIONS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TIKTOK', label: 'TikTok' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'INACTIVE', label: 'Inactiva' },
];

export default function SocialAccountsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const [filters, setFilters] = useState<SocialAccountFilters>({ search: '', platform: '', status: '', page: 0, size: 12 });
  const [formOpen, setFormOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState<SocialAccountResponse | null>(null);

  const canCreate = hasPermission(PERMISSIONS.SOCIAL_ACCOUNT_CREATE);
  const canEdit = hasPermission(PERMISSIONS.SOCIAL_ACCOUNT_UPDATE);
  const canToggle = hasPermission(PERMISSIONS.SOCIAL_ACCOUNT_STATUS_UPDATE);
  const canReveal = hasPermission(PERMISSIONS.SOCIAL_ACCOUNT_CREDENTIAL_REVEAL);

  const { data, isLoading, isError, refetch } = useSocialAccounts(filters);
  const page = data?.data;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['social-accounts'] });

  const saveMutation = useMutation({
    mutationFn: (form: EditSocialAccountFormData) => {
      if (selected) {
        return socialAccountsApi.update(selected.id, {
          platformCode: form.platformCode,
          accountName: form.accountName,
          accessUsername: form.accessUsername || undefined,
          accessSecret: form.accessSecret || undefined,
        });
      }
      return socialAccountsApi.create({
        platformCode: form.platformCode,
        accountName: form.accountName,
        accessUsername: form.accessUsername ?? '',
        accessSecret: form.accessSecret ?? '',
      });
    },
    onSuccess: () => {
      showToast({ title: selected ? 'Cuenta actualizada' : 'Red social registrada', variant: 'success' });
      setFormOpen(false);
      setSelected(null);
      invalidate();
    },
    onError: (err: unknown) => {
      showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo guardar la cuenta'), variant: 'error' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => socialAccountsApi.changeStatus(id, status),
    onSuccess: () => {
      showToast({ title: selected?.status === 'ACTIVE' ? 'Cuenta desactivada' : 'Cuenta activada', variant: 'success' });
      setStatusOpen(false);
      setSelected(null);
      invalidate();
    },
    onError: (err: unknown) => {
      showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo actualizar el estado'), variant: 'error' });
    },
  });

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (account: SocialAccountResponse) => { setSelected(account); setFormOpen(true); };
  const openStatus = (account: SocialAccountResponse) => { setSelected(account); setStatusOpen(true); };

  const accounts = page?.content ?? [];

  return (
    <div>
      <PageHeader
        title="Redes Sociales"
        subtitle="Gestiona las plataformas y credenciales de MANJAU"
        action={
          canCreate && (
            <button className="btn-primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Nueva red social
            </button>
          )
        }
      />

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 0 }))}
            placeholder="Buscar por nombre de cuenta..."
          />
        </div>
        <FilterSelect value={filters.platform} onChange={(v) => setFilters((f) => ({ ...f, platform: v, page: 0 }))} options={PLATFORM_OPTIONS} placeholder="Plataforma" />
        <FilterSelect value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v, page: 0 }))} options={STATUS_OPTIONS} placeholder="Estado" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <LoadingSkeleton count={3} className="h-64 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState message="No se pudieron cargar las cuentas" onRetry={refetch} />
      ) : accounts.length === 0 ? (
        <EmptyState title="Sin cuentas registradas" description="Registra la primera red social de MANJAU." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <SocialAccountCard
                key={account.id}
                account={account}
                canEdit={canEdit}
                canToggle={canToggle}
                canReveal={canReveal}
                onEdit={openEdit}
                onToggleStatus={openStatus}
              />
            ))}
            <PermissionGuard permission={PERMISSIONS.SOCIAL_ACCOUNT_CREATE}>
              <button
                onClick={openCreate}
                className="min-h-[260px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-lavender/40 text-lavender text-xs hover:bg-lavender-soft/40 transition-colors"
              >
                <span className="w-12 h-12 rounded-full bg-lavender-soft grid place-items-center text-2xl">＋</span>
                Agregar red social
              </button>
            </PermissionGuard>
          </div>
          {page && <Pagination page={page.page} totalPages={page.totalPages} totalElements={page.totalElements} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}
        </>
      )}

      <SocialAccountFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setSelected(null); }}
        account={selected}
        onSubmit={async (form) => { await saveMutation.mutateAsync(form); }}
        isSubmitting={saveMutation.isPending}
      />

      <ConfirmDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title={selected?.status === 'ACTIVE' ? 'Desactivar cuenta' : 'Activar cuenta'}
        message={
          selected?.status === 'ACTIVE'
            ? 'La cuenta dejará de estar disponible para nuevas publicaciones. Podrás reactivarla luego.'
            : 'La cuenta volverá a estar disponible para publicar.'
        }
        confirmLabel={selected?.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
        variant={selected?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
        onConfirm={() => selected && statusMutation.mutate({ id: selected.id, status: selected.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
      />
    </div>
  );
}
