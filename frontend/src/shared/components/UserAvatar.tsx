import { cn } from '@/shared/lib/utils';

interface UserAvatarProps {
  initials: string;
  className?: string;
}

export function UserAvatar({ initials, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'w-9 h-9 rounded-full bg-soft-pink text-primary flex items-center justify-center text-sm font-semibold',
        className,
      )}
    >
      {initials}
    </div>
  );
}
