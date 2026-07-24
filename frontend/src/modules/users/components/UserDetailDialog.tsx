import { CalendarDays, CreditCard, Mail, ShieldCheck, Timer, UserRound } from 'lucide-react';
import { AppDialog } from '@/shared/components/AppDialog';
import { formatDateTime } from '@/shared/lib/utils';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import type { UserResponse } from '../types/userTypes';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-pink-soft/25 p-4">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Icon className="h-4 w-4 text-pink" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-text">{children}</div>
    </div>
  );
}

export function UserDetailDialog({ open, onOpenChange, user }: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Detalle del usuario"
      description="Información registrada en el sistema"
      className="max-w-[680px]"
    >
      <div className="mb-5 flex items-center gap-4 rounded-2xl bg-pink-soft/45 p-5">
        <UserAvatar initials={user.initials} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-text">{user.fullName}</h3>
          <p className="mt-1 truncate text-sm text-text-muted">{user.institutionalEmail}</p>
        </div>
        <div className="ml-auto">
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem icon={UserRound} label="Nombres y apellidos">
          {user.firstName} {user.paternalSurname} {user.maternalSurname}
        </DetailItem>
        <DetailItem icon={CreditCard} label="DNI">{user.dni}</DetailItem>
        <DetailItem icon={Mail} label="Correo institucional">{user.institutionalEmail}</DetailItem>
        <DetailItem icon={ShieldCheck} label="Rol">
          <UserRoleBadge roleCode={user.role.code} roleName={user.role.name} />
        </DetailItem>
        <DetailItem icon={CalendarDays} label="Fecha de creación">
          {formatDateTime(user.createdAt)}
        </DetailItem>
        <DetailItem icon={Timer} label="Último acceso">
          {user.lastAccessAt ? formatDateTime(user.lastAccessAt) : 'Todavía no ha iniciado sesión'}
        </DetailItem>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => onOpenChange(false)}>
          Cerrar
        </button>
      </div>
    </AppDialog>
  );
}
