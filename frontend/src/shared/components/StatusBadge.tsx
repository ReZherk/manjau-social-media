import { cn } from '@/shared/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-success-soft text-success',
  INACTIVE: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status] || 'bg-gray-100 text-gray-500',
        className,
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
