import {
  LayoutDashboard, Home, Users, Shield, Share2, PenSquare,
  CalendarClock, History, BarChart3, TrendingUp, FileBarChart,
} from 'lucide-react';
import { PERMISSIONS } from '@/app/permissions/permissions';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  requiredPermission: string;
  section: string;
  /** Hide this item when the user also holds this permission (avoids showing
   *  both the admin dashboard and the CM panel to an administrator). */
  hideForPermission?: string;
}

export const MENU_SECTIONS = ['GENERAL', 'ADMINISTRACIÓN', 'PUBLICACIONES', 'MARKETING'] as const;

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, requiredPermission: PERMISSIONS.ADMIN_DASHBOARD_VIEW, section: 'GENERAL' },
  { label: 'Mi Panel', path: '/dashboard', icon: Home, requiredPermission: PERMISSIONS.PUBLICATION_VIEW, section: 'GENERAL', hideForPermission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },

  { label: 'Usuarios', path: '/admin/users', icon: Users, requiredPermission: PERMISSIONS.USER_VIEW, section: 'ADMINISTRACIÓN' },
  { label: 'Auditoría', path: '/admin/audit', icon: Shield, requiredPermission: PERMISSIONS.AUDIT_VIEW, section: 'ADMINISTRACIÓN' },

  { label: 'Redes Sociales', path: '/social-accounts', icon: Share2, requiredPermission: PERMISSIONS.SOCIAL_ACCOUNT_VIEW, section: 'PUBLICACIONES' },
  { label: 'Nueva Publicación', path: '/publications/new', icon: PenSquare, requiredPermission: PERMISSIONS.PUBLICATION_CREATE, section: 'PUBLICACIONES' },
  { label: 'Programadas', path: '/publications/scheduled', icon: CalendarClock, requiredPermission: PERMISSIONS.PUBLICATION_VIEW, section: 'PUBLICACIONES' },
  { label: 'Historial', path: '/publications/history', icon: History, requiredPermission: PERMISSIONS.PUBLICATION_HISTORY_VIEW, section: 'PUBLICACIONES' },

  { label: 'Registrar Métricas', path: '/metrics/register', icon: BarChart3, requiredPermission: PERMISSIONS.METRIC_CREATE, section: 'MARKETING' },
  { label: 'Indicadores KPI', path: '/kpis', icon: TrendingUp, requiredPermission: PERMISSIONS.KPI_VIEW, section: 'MARKETING' },
  { label: 'Reportes', path: '/reports', icon: FileBarChart, requiredPermission: PERMISSIONS.REPORT_VIEW, section: 'MARKETING' },
];

/** Menu items the user is allowed to see, respecting hideForPermission. */
export function visibleMenuItems(hasPermission: (p: string) => boolean): MenuItem[] {
  return MENU_ITEMS.filter(
    (item) =>
      hasPermission(item.requiredPermission) &&
      !(item.hideForPermission && hasPermission(item.hideForPermission)),
  );
}

/** First route the authenticated user can land on after login. */
export function getLandingPath(hasPermission: (p: string) => boolean): string {
  const items = visibleMenuItems(hasPermission);
  return items[0]?.path ?? '/403';
}
