import { cn } from '@/shared/lib/utils';
import { platformStyle } from '@/shared/lib/catalog';

interface NetworkTagProps {
  code: string;
  label?: string;
  className?: string;
}

/** Small pill badge for a social platform (Instagram / Facebook / TikTok). */
export function NetworkTag({ code, label, className }: NetworkTagProps) {
  const style = platformStyle(code);
  return (
    <span className={cn('badge text-[10px]', style.tagClass, className)}>
      {label ?? style.label}
    </span>
  );
}

/** Circular short-code dot used in dense tables. */
export function NetworkDot({ code }: { code: string }) {
  const style = platformStyle(code);
  return (
    <span
      className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-semibold', style.tagClass)}
      title={style.label}
    >
      {style.short}
    </span>
  );
}
