import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchInput } from '@/shared/components/SearchInput';
import { FilterSelect } from '@/shared/components/FilterSelect';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { PermissionGuard } from '@/app/permissions/PermissionGuard';
import { PERMISSIONS } from '@/app/permissions/permissions';
import { useUsers } from '../hooks/useUsers';
import { usersApi } from '../api/usersApi';
import { UsersTable } from '../components/UsersTable';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { EditUserDialog } from '../components/EditUserDialog';
import { ChangeUserStatusDialog } from '../components/ChangeUserStatusDialog';
import { ResetCredentialsDialog } from '../components/ResetCredentialsDialog';
import { UserDetailDialog } from '../components/UserDetailDialog';
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from '../types/userTypes';
import type { CreateUserFormData, UpdateUserFormData } from '../schemas/userSchemas';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 0,
    size: 10,
  });

  const { data, isLoading, isError, refetch } = useUsers(filters);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      showToast({ title: 'Usuario creado', description: 'Las credenciales fueron enviadas al correo', variant: 'success' });
      setCreateOpen(false);
      invalidate();
    },
    onError: (err: unknown) => {
      showToast({ title: 'Error', description: getErrorMessage(err, 'Error al crear usuario'), variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => usersApi.update(id, data),
    onSuccess: () => {
      showToast({ title: 'Usuario actualizado', variant: 'success' });
      setEditOpen(false);
      invalidate();
    },
    onError: (err: unknown) => {
      showToast({ title: 'Error', description: getErrorMessage(err, 'Error al actualizar usuario'), variant: 'error' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => usersApi.changeStatus(id, status),
    onSuccess: () => {
      showToast({
        title: selectedUser?.status === 'ACTIVE' ? 'Usuario desactivado' : 'Usuario activado',
        variant: 'success',
      });
      setStatusOpen(false);
      invalidate();
    },
    onError: () => {
      showToast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'error' });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => usersApi.resetCredentials(id),
    onSuccess: () => {
      showToast({ title: 'Credenciales enviadas', description: 'Las nuevas credenciales fueron enviadas al correo', variant: 'success' });
      setResetOpen(false);
    },
    onError: () => {
      showToast({ title: 'Error', description: 'No se pudo restablecer las credenciales', variant: 'error' });
    },
  });

  const handleCreate = async (formData: CreateUserFormData) => {
    await createMutation.mutateAsync(formData);
  };

  const handleEdit = async (formData: UpdateUserFormData) => {
    if (!selectedUser) return;
    await updateMutation.mutateAsync({ id: selectedUser.id, data: formData });
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: selectedUser.id, status: newStatus });
  };

  const handleResetCredentials = () => {
    if (!selectedUser) return;
    resetMutation.mutate(selectedUser.id);
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra cuentas y roles del sistema"
        action={
          <PermissionGuard permission={PERMISSIONS.USER_CREATE}>
            <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Nuevo usuario
            </button>
          </PermissionGuard>
        }
      />

      {/* Search and filters */}
      <div className="card p-4 mb-6 space-y-4">
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search, page: 0 }))}
          placeholder="Buscar por nombre, correo o DNI..."
        />
        <div className="flex gap-3">
          <FilterSelect
            value={filters.role}
            onChange={(role) => setFilters((prev) => ({ ...prev, role, page: 0 }))}
            options={[
              { value: 'ADMINISTRATOR', label: 'Administrador' },
              { value: 'COMMUNITY_MANAGER', label: 'Community Manager' },
              { value: 'MARKETING_ANALYST', label: 'Analista de Marketing' },
            ]}
            placeholder="Todos los roles"
          />
          <FilterSelect
            value={filters.status}
            onChange={(status) => setFilters((prev) => ({ ...prev, status, page: 0 }))}
            options={[
              { value: 'ACTIVE', label: 'Activo' },
              { value: 'INACTIVE', label: 'Inactivo' },
            ]}
            placeholder="Todos los estados"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={8} className="h-10" />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : !data?.data?.content?.length ? (
          <EmptyState
            title={filters.search ? 'Sin resultados de búsqueda' : 'No hay usuarios'}
            description={filters.search ? 'Intenta con otros términos de búsqueda' : 'Crea el primer usuario para comenzar'}
          />
        ) : (
          <div className="p-6">
            <UsersTable
              users={data.data.content}
              onView={(u) => { setSelectedUser(u); setDetailOpen(true); }}
              onEdit={(u) => { setSelectedUser(u); setEditOpen(true); }}
              onToggleStatus={(u) => { setSelectedUser(u); setStatusOpen(true); }}
              onResetCredentials={(u) => { setSelectedUser(u); setResetOpen(true); }}
            />
            <Pagination
              page={data.data.page}
              totalPages={data.data.totalPages}
              totalElements={data.data.totalElements}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        user={selectedUser}
      />

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onSubmit={handleEdit}
        isSubmitting={updateMutation.isPending}
      />

      <ChangeUserStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        user={selectedUser}
        onConfirm={handleToggleStatus}
        isLoading={statusMutation.isPending}
      />

      <ResetCredentialsDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={selectedUser}
        onConfirm={handleResetCredentials}
        isLoading={resetMutation.isPending}
      />
    </div>
  );
}
