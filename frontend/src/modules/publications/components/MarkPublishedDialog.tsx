import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AppDialog } from '@/shared/components/AppDialog';
import { formatDateTime } from '@/shared/lib/utils';
import { markPublishedSchema, type MarkPublishedFormData } from '../schemas/publicationSchemas';
import type { PublicationResponse } from '../types/publicationTypes';

interface MarkPublishedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication: PublicationResponse | null;
  onSubmit: (data: MarkPublishedFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function MarkPublishedDialog({ open, onOpenChange, publication, onSubmit, isSubmitting }: MarkPublishedDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MarkPublishedFormData>({
    resolver: zodResolver(markPublishedSchema),
  });

  useEffect(() => {
    if (open) reset({ evidenceLink: '' });
  }, [open, reset]);

  return (
    <AppDialog open={open} onOpenChange={onOpenChange} title="Marcar como realizada" description="Confirma que la publicación fue publicada y registra el enlace de evidencia.">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-11 h-11 rounded-2xl bg-mint-soft text-mint grid place-items-center mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        {publication && (
          <>
            <p className="text-sm text-text">
              ¿Confirmas que <strong>{publication.title}</strong> fue publicada?
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              {formatDateTime(publication.scheduledAt)} · {publication.targetAccounts.map((a) => a.platformName).join(', ')}
            </p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Enlace de evidencia *</label>
          <input {...register('evidenceLink')} placeholder="https://instagram.com/p/..." className="input-field" />
          {errors.evidenceLink && <p className="text-danger text-xs mt-1">{errors.evidenceLink.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button type="button" onClick={() => onOpenChange(false)} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirmar
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
