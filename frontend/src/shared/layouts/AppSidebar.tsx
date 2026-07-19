import { NavLink } from 'react-router-dom';
import { LogOut, ChevronRight, CakeSlice } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { cn } from '@/shared/lib/utils';
import { MENU_SECTIONS, visibleMenuItems } from '@/app/config/menu';

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const items = visibleMenuItems(hasPermission);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-overlay z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'w-sidebar shrink-0 bg-sidebar border-r border-border flex flex-col justify-between',
          'fixed inset-y-0 left-0 z-40 transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
            <div className="w-9 h-9 rounded-xl bg-lavender text-white grid place-items-center">
              <CakeSlice className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-[15px] leading-tight text-text">MANJAU</p>
              <p className="text-[10px] text-text-muted">Redes Sociales</p>
            </div>
          </div>

          {/* User card */}
          {user && (
            <div className="mx-3 mb-3 flex items-center gap-3 p-3 rounded-2xl bg-lavender-soft/60">
              <div className="w-9 h-9 rounded-full bg-lavender text-white grid place-items-center text-[11px] font-bold">
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text truncate">{user.fullName}</p>
                <p className="text-[10px] text-text-muted truncate">{user.role.name}</p>
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
            {MENU_SECTIONS.map((section) => {
              const sectionItems = items.filter((i) => i.section === section);
              if (sectionItems.length === 0) return null;
              return (
                <div key={section}>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#c4aecf] px-2 pt-3 pb-1">
                    {section}
                  </p>
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'grid grid-cols-[22px_1fr_16px] items-center gap-1.5 px-3 min-h-[40px] rounded-xl text-xs transition-colors',
                            isActive
                              ? 'text-lavender bg-[#f2e8f8] font-medium'
                              : 'text-[#655b63] hover:text-lavender hover:bg-[#f2e8f8]/60',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 justify-self-end" />}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
