import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { AppDialog } from '@/shared/components/AppDialog';
import { updateUserSchema, type UpdateUserFormData } from '../schemas/userSchemas';
import { useRoles } from '../hooks/useRoles';
import type { UserResponse, RoleResponse } from '../types/userTypes';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, isSubmitting }: EditUserDialogProps) {
  const { data: roles } = useRoles();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName,
        paternalSurname: user.paternalSurname,
        maternalSurname: user.maternalSurname,
        institutionalEmail: user.institutionalEmail,
        roleCode: user.role.code,
      });
    }
  }, [user, open, reset]);

  const handleFormSubmit = async (data: UpdateUserFormData) => {
    await onSubmit(data);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) {
          onOpenChange(val);
          if (!val) reset();
        }
      }}
      title="Editar Usuario"
      description="Actualiza los datos del usuario"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Nombres</label>
          <input {...register('firstName')} className="input-field" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Apellido paterno</label>
            <input {...register('paternalSurname')} className="input-field" />
            {errors.paternalSurname && <p className="text-red-500 text-xs mt-1">{errors.paternalSurname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Apellido materno</label>
            <input {...register('maternalSurname')} className="input-field" />
            {errors.maternalSurname && <p className="text-red-500 text-xs mt-1">{errors.maternalSurname.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Correo institucional</label>
          <input {...register('institutionalEmail')} className="input-field" />
          {errors.institutionalEmail && <p className="text-red-500 text-xs mt-1">{errors.institutionalEmail.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Rol</label>
          <select {...register('roleCode')} className="input-field">
            <option value="">Seleccionar rol</option>
            {roles?.data?.map((role: RoleResponse) => (
              <option key={role.id} value={role.code}>{role.name}</option>
            ))}
          </select>
          {errors.roleCode && <p className="text-red-500 text-xs mt-1">{errors.roleCode.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { onOpenChange(false); reset(); }}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
