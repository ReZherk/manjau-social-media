import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { AppDialog } from '@/shared/components/AppDialog';
import { usePlatforms } from '@/shared/hooks/useReference';
import type { ReferenceItem } from '@/shared/api/referenceApi';
import {
  createSocialAccountSchema,
  editSocialAccountSchema,
  type EditSocialAccountFormData,
} from '../schemas/socialAccountSchemas';
import type { SocialAccountResponse } from '../types/socialAccountTypes';

interface SocialAccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: SocialAccountResponse | null;
  onSubmit: (data: EditSocialAccountFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function SocialAccountFormDialog({ open, onOpenChange, account, onSubmit, isSubmitting }: SocialAccountFormDialogProps) {
  const isEdit = !!account;
  const { data: platforms } = usePlatforms();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSocialAccountFormData>({
    resolver: zodResolver(isEdit ? editSocialAccountSchema : createSocialAccountSchema) as Resolver<EditSocialAccountFormData>,
  });

  useEffect(() => {
    if (open) {
      reset({
        platformCode: account?.platformCode ?? '',
        accountName: account?.accountName ?? '',
        accessUsername: '',
        accessSecret: '',
      });
    }
  }, [open, account, reset]);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar red social' : 'Nueva red social'}
      description={isEdit ? 'Actualiza los datos de la cuenta' : 'Completa los datos de la cuenta'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Plataforma</label>
          <select {...register('platformCode')} className="input-field">
            <option value="">Selecciona una plataforma</option>
            {platforms?.data.map((p: ReferenceItem) => (
              <option key={p.id} value={p.code}>{p.name}</option>
            ))}
          </select>
          {errors.platformCode && <p className="text-danger text-xs mt-1">{errors.platformCode.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Nombre de la cuenta</label>
          <input {...register('accountName')} placeholder="Ej. @manjau.pasteleria" className="input-field" />
          {errors.accountName && <p className="text-danger text-xs mt-1">{errors.accountName.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Usuario de acceso</label>
          <input {...register('accessUsername')} placeholder="usuario@correo.com" className="input-field" autoComplete="off" />
          {errors.accessUsername && <p className="text-danger text-xs mt-1">{errors.accessUsername.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Contraseña / credencial</label>
          <input {...register('accessSecret')} type="password" placeholder="••••••••" className="input-field" autoComplete="new-password" />
          {errors.accessSecret && <p className="text-danger text-xs mt-1">{errors.accessSecret.message}</p>}
          <p className="text-[10px] text-text-muted mt-1">
            {isEdit
              ? 'Déjalo en blanco para conservar las credenciales actuales.'
              : 'Se almacena cifrada y nunca se muestra en los listados.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="btn-secondary" disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Registrar red social'}
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
