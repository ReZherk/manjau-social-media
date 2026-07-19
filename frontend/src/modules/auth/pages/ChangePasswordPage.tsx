import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { getErrorMessage } from '@/shared/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { getLandingPath } from '@/app/config/menu';
import { useToast } from '@/shared/components/ToastProvider';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Al menos una mayúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Al menos una minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Al menos un número', test: (v: string) => /\d/.test(v) },
];

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refreshUser, hasPermission } = useAuth();
  const { showToast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      await refreshUser();
      showToast({ title: 'Contraseña actualizada', description: 'Tu contraseña ha sido cambiada exitosamente', variant: 'success' });
      navigate(getLandingPath(hasPermission));
    } catch (err: unknown) {
      showToast({ title: 'Error', description: getErrorMessage(err, 'Error al cambiar la contraseña'), variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-card p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-soft-pink flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text">Cambiar Contraseña</h2>
          <p className="text-sm text-text-muted mt-1">
            Debes cambiar tu contraseña temporal para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                {...register('currentPassword')}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-label={showCurrent ? 'Ocultar' : 'Mostrar'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                {...register('newPassword')}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-label={showNew ? 'Ocultar' : 'Mostrar'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req) => (
                <p key={req.label} className={`text-xs flex items-center gap-1.5 ${req.test(newPassword) ? 'text-success' : 'text-text-muted'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${req.test(newPassword) ? 'bg-success' : 'bg-text-muted'}`} />
                  {req.label}
                </p>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
