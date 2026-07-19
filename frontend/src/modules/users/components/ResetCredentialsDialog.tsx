import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { UserResponse } from '../types/userTypes';

interface ResetCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ResetCredentialsDialog({
  open,
  onOpenChange,
  user: _user,
  onConfirm,
  isLoading,
}: ResetCredentialsDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restablecer credenciales"
      message="Se generará una nueva contraseña temporal y se enviará al correo institucional del usuario. El usuario deberá cambiarla al ingresar."
      confirmLabel="Generar y enviar"
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="primary"
    />
  );
}
