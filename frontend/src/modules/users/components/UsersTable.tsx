import { UserAvatar } from '@/shared/components/UserAvatar';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActionsMenu } from './UserActionsMenu';
import { formatDateTime } from '@/shared/lib/utils';
import type { UserResponse } from '../types/userTypes';

interface UsersTableProps {
  users: UserResponse[];
  onView: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onResetCredentials: (user: UserResponse) => void;
}

export function UsersTable({ users, onView, onEdit, onToggleStatus, onResetCredentials }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Usuario</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">DNI</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Correo</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Rol</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Último acceso</th>
            <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar initials={user.initials} />
                  <span className="text-sm font-medium text-text">{user.fullName}</span>
                </div>
              </td>
              <td className="py-3 text-sm text-text-muted">{user.dni}</td>
              <td className="py-3 text-sm text-text-muted">{user.institutionalEmail}</td>
              <td className="py-3">
                <UserRoleBadge roleCode={user.role.code} roleName={user.role.name} />
              </td>
              <td className="py-3">
                <UserStatusBadge status={user.status} />
              </td>
              <td className="py-3 text-sm text-text-muted">{formatDateTime(user.lastAccessAt)}</td>
              <td className="py-3">
                <UserActionsMenu
                  user={user}
                  onView={onView}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onResetCredentials={onResetCredentials}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
