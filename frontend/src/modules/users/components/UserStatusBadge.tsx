import { StatusBadge } from '@/shared/components/StatusBadge';

interface UserStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE';
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return <StatusBadge status={status} />;
}
