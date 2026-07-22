import { Menu } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

interface AppTopbarProps {
  onMenuClick: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-topbar bg-pink text-white px-4 sm:px-8 flex items-center gap-3 shadow-soft">
      <button
        className="lg:hidden p-2 -ml-1 hover:bg-white/15 rounded-lg text-white"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div><strong className="block text-sm uppercase tracking-wide">{user?.role.name ?? 'MANJAU'}</strong><span className="text-xs text-white/80">Sistema de gestión de redes sociales</span></div>

      <div className="flex-1" />

      {user && (
        <div className="w-10 h-10 rounded-full bg-white text-blue grid place-items-center text-xs font-bold">
          {user.initials}
        </div>
      )}
    </header>
  );
}
