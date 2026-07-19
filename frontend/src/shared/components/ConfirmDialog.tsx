import * as Dialog from '@radix-ui/react-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  onConfirm,
  isLoading,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[400px] bg-surface p-6 rounded-3xl shadow-dialog focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-text mb-2">
            {title}
          </Dialog.Title>
          <p className="text-sm text-text-muted mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <Dialog.Close className="btn-secondary" disabled={isLoading}>
              Cancelar
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            >
              {isLoading ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
