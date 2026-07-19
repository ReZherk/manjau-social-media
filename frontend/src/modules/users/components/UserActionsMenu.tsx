import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, Eye, Edit2, UserX, UserCheck, KeyRound } from 'lucide-react';
import { PermissionGuard } from '@/app/permissions/PermissionGuard';
import type { UserResponse } from '../types/userTypes';

interface UserActionsMenuProps {
  user: UserResponse;
  onView: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onResetCredentials: (user: UserResponse) => void;
}

export function UserActionsMenu({
  user,
  onView,
  onEdit,
  onToggleStatus,
  onResetCredentials,
}: UserActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-1 hover:bg-soft-pink rounded-lg transition-colors" aria-label="Acciones">
          <MoreHorizontal className="w-4 h-4 text-text-muted" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-surface rounded-xl shadow-dialog border border-border p-1.5 min-w-[180px] z-50"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onClick={() => onView(user)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-text rounded-lg hover:bg-soft-pink cursor-pointer outline-none"
          >
            <Eye className="w-4 h-4" />
            Ver detalle
          </DropdownMenu.Item>

          <PermissionGuard permission="USER_UPDATE">
            <DropdownMenu.Item
              onClick={() => onEdit(user)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-text rounded-lg hover:bg-soft-pink cursor-pointer outline-none"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </DropdownMenu.Item>
          </PermissionGuard>

          <PermissionGuard permission="USER_STATUS_UPDATE">
            <DropdownMenu.Item
              onClick={() => onToggleStatus(user)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-text rounded-lg hover:bg-soft-pink cursor-pointer outline-none"
            >
              {user.status === 'ACTIVE' ? (
                <>
                  <UserX className="w-4 h-4 text-red-500" />
                  <span>Desactivar</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-success" />
                  <span>Reactivar</span>
                </>
              )}
            </DropdownMenu.Item>
          </PermissionGuard>

          <PermissionGuard permission="USER_RESET_CREDENTIALS">
            <DropdownMenu.Item
              onClick={() => onResetCredentials(user)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-text rounded-lg hover:bg-soft-pink cursor-pointer outline-none"
            >
              <KeyRound className="w-4 h-4" />
              Restablecer credenciales
            </DropdownMenu.Item>
          </PermissionGuard>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
