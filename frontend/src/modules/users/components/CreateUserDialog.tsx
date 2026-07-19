import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { AppDialog } from '@/shared/components/AppDialog';
import { createUserSchema, type CreateUserFormData } from '../schemas/userSchemas';
import { useRoles } from '../hooks/useRoles';
import type { RoleResponse } from '../types/userTypes';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, isSubmitting }: CreateUserDialogProps) {
  const { data: roles } = useRoles();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const handleFormSubmit = async (data: CreateUserFormData) => {
    await onSubmit(data);
    reset();
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
      title="Nuevo Usuario"
      description="El sistema enviará credenciales temporales al correo registrado"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">DNI</label>
          <input {...register('dni')} className="input-field" placeholder="12345678" />
          {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Nombres</label>
          <input {...register('firstName')} className="input-field" placeholder="Nombres" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Apellido paterno</label>
            <input {...register('paternalSurname')} className="input-field" placeholder="Paterno" />
            {errors.paternalSurname && <p className="text-red-500 text-xs mt-1">{errors.paternalSurname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Apellido materno</label>
            <input {...register('maternalSurname')} className="input-field" placeholder="Materno" />
            {errors.maternalSurname && <p className="text-red-500 text-xs mt-1">{errors.maternalSurname.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Correo institucional</label>
          <input {...register('institutionalEmail')} className="input-field" placeholder="usuario@manjau.com" />
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

        <div className="bg-soft-pink/50 rounded-xl p-3 text-xs text-text-muted">
          Se generará automáticamente una contraseña temporal y se enviará al correo del usuario.
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
            {isSubmitting ? 'Creando...' : 'Crear y enviar credenciales'}
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
