import { RoleBadge } from '@/shared/components/RoleBadge';

interface UserRoleBadgeProps {
  roleCode: string;
  roleName: string;
}

export function UserRoleBadge({ roleCode, roleName }: UserRoleBadgeProps) {
  return <RoleBadge roleCode={roleCode} roleName={roleName} />;
}
