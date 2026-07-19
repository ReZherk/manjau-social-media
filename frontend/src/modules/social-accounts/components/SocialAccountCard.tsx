import { useState } from 'react';
import { Eye, EyeOff, Pencil, Power, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { platformStyle, accountStatusStyle } from '@/shared/lib/catalog';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { socialAccountsApi } from '../api/socialAccountsApi';
import type { SocialAccountResponse, RevealCredentialResponse } from '../types/socialAccountTypes';

interface SocialAccountCardProps {
  account: SocialAccountResponse;
  canEdit: boolean;
  canToggle: boolean;
  canReveal: boolean;
  onEdit: (account: SocialAccountResponse) => void;
  onToggleStatus: (account: SocialAccountResponse) => void;
}

export function SocialAccountCard({ account, canEdit, canToggle, canReveal, onEdit, onToggleStatus }: SocialAccountCardProps) {
  const { showToast } = useToast();
  const style = platformStyle(account.platformCode);
  const status = accountStatusStyle(account.status);
  const isActive = account.status === 'ACTIVE';

  const [revealed, setRevealed] = useState<RevealCredentialResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleReveal = async () => {
    if (revealed) {
      setRevealed(null);
      return;
    }
    setLoading(true);
    try {
      const res = await socialAccountsApi.reveal(account.id);
      setRevealed(res.data);
    } catch (err) {
      showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudieron revelar las credenciales'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card overflow-hidden flex flex-col">
      {/* Header */}
      <div className={cn('p-4', style.softClass)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/80 grid place-items-center text-[11px] font-bold shrink-0">
              {style.short}
            </div>
            <div className="min-w-0">
              <strong className="block text-xs font-semibold truncate">{account.accountName}</strong>
              <span className="block text-[10px] text-text-muted">{style.label}</span>
            </div>
          </div>
          <span className={cn('badge text-[10px]', status.className)}>{status.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div>
          <label className="block text-[10px] text-text-muted mb-1">Usuario</label>
          <div className="h-8 flex items-center px-3 rounded-full bg-input-bg text-[11px] font-mono text-text/80">
            {revealed ? revealed.accessUsername : '••••••••'}
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-1">Contraseña</label>
          <div className="h-8 flex items-center justify-between px-3 rounded-full bg-input-bg text-[11px] font-mono text-text/80">
            <span>{revealed ? revealed.accessSecret : '••••••••••••'}</span>
            {canReveal && (
              <button
                type="button"
                onClick={toggleReveal}
                disabled={loading}
                className="text-text-muted hover:text-lavender"
                aria-label={revealed ? 'Ocultar credenciales' : 'Revelar credenciales'}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {canEdit && (
            <button className="btn-outline" onClick={() => onEdit(account)}>
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
          {canToggle && (
            <button
              className={cn('btn-outline', isActive && 'text-danger border-danger/40 hover:bg-danger/5')}
              onClick={() => onToggleStatus(account)}
            >
              <Power className="w-3.5 h-3.5" /> {isActive ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
