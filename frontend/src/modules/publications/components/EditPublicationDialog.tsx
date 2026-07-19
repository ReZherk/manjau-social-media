import { AppDialog } from '@/shared/components/AppDialog';
import { PublicationForm } from './PublicationForm';
import type { CreatePublicationRequest, PublicationResponse } from '../types/publicationTypes';

interface EditPublicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication: PublicationResponse | null;
  onSubmit: (data: CreatePublicationRequest) => Promise<void>;
  isSubmitting: boolean;
}

export function EditPublicationDialog({ open, onOpenChange, publication, onSubmit, isSubmitting }: EditPublicationDialogProps) {
  return (
    <AppDialog open={open} onOpenChange={onOpenChange} title="Editar publicación" description="Modifica los datos de la publicación programada." className="max-w-[640px]">
      {publication && (
        <PublicationForm
          initial={publication}
          mode="edit"
          submitLabel="Guardar cambios"
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      )}
    </AppDialog>
  );
}
