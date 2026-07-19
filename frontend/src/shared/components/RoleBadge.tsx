import { cn } from '@/shared/lib/utils';

interface RoleBadgeProps {
  roleCode: string;
  roleName: string;
  className?: string;
}

const roleStyles: Record<string, string> = {
  ADMINISTRATOR: 'bg-soft-pink text-primary',
  COMMUNITY_MANAGER: 'bg-purple-soft text-purple',
  MARKETING_ANALYST: 'bg-success-soft text-success',
};

export function RoleBadge({ roleCode, roleName, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        roleStyles[roleCode] || 'bg-gray-100 text-gray-500',
        className,
      )}
    >
      {roleName}
    </span>
  );
}
