import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

interface AppTopbarProps {
  onMenuClick: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-topbar bg-surface/95 backdrop-blur border-b border-border px-4 sm:px-7 flex items-center gap-3">
      <button
        className="lg:hidden p-2 -ml-1 hover:bg-soft-pink rounded-lg text-text-muted"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-[10px] text-lavender bg-lavender-soft px-3 py-1.5 rounded-full">
        {user?.role.name ?? 'Usuario'}
      </span>

      <div className="flex-1" />

      <button className="relative p-2 text-text-muted hover:text-text" aria-label="Notificaciones">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink" />
      </button>

      {user && (
        <div className="w-8 h-8 rounded-full bg-lavender text-white grid place-items-center text-[11px] font-bold">
          {user.initials}
        </div>
      )}
    </header>
  );
}
