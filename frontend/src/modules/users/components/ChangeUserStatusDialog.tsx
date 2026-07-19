import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { UserResponse } from '../types/userTypes';

interface ChangeUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ChangeUserStatusDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading,
}: ChangeUserStatusDialogProps) {
  if (!user) return null;

  const isDeactivating = user.status === 'ACTIVE';

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isDeactivating ? 'Desactivar usuario' : 'Reactivar usuario'}
      message={
        isDeactivating
          ? 'El usuario perderá el acceso al sistema, pero sus datos e historial serán conservados.'
          : 'El usuario podrá volver a iniciar sesión con sus credenciales vigentes.'
      }
      confirmLabel={isDeactivating ? 'Desactivar' : 'Reactivar'}
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant={isDeactivating ? 'danger' : 'primary'}
    />
  );
}
