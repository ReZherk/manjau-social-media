/**
 * Central styling/labels for reference catalogs (platforms, content types,
 * publication status). Keeps colors and labels out of the JSX and consistent
 * across the Community Manager modules.
 */

export interface PlatformStyle {
  label: string;
  short: string;
  tagClass: string;
  softClass: string;
}

export const PLATFORM_STYLES: Record<string, PlatformStyle> = {
  INSTAGRAM: { label: 'Instagram', short: 'In', tagClass: 'text-pink bg-pink-soft', softClass: 'bg-pink-soft' },
  FACEBOOK: { label: 'Facebook', short: 'Fa', tagClass: 'text-blue bg-blue-soft', softClass: 'bg-blue-soft' },
  TIKTOK: { label: 'TikTok', short: 'Ti', tagClass: 'text-lavender bg-lavender-soft', softClass: 'bg-lavender-soft' },
};

export function platformStyle(code: string): PlatformStyle {
  return PLATFORM_STYLES[code] ?? { label: code, short: code.slice(0, 2), tagClass: 'text-text-muted bg-soft-pink', softClass: 'bg-soft-pink' };
}

export const CONTENT_TYPE_STYLES: Record<string, string> = {
  IMAGE: 'text-mint bg-mint-soft',
  VIDEO: 'text-pink bg-pink-soft',
  CAROUSEL: 'text-lavender bg-lavender-soft',
  REEL: 'text-peach bg-peach-soft',
  STORY: 'text-blue bg-blue-soft',
};

export function contentTypeClass(code: string): string {
  return CONTENT_TYPE_STYLES[code] ?? 'text-text-muted bg-soft-pink';
}

export interface StatusStyle {
  label: string;
  className: string;
}

export const PUBLICATION_STATUS_STYLES: Record<string, StatusStyle> = {
  SCHEDULED: { label: 'programada', className: 'text-mint bg-mint-soft' },
  DRAFT: { label: 'borrador', className: 'text-text-muted bg-soft-pink' },
  PUBLISHED: { label: 'realizada', className: 'text-mint bg-mint-soft' },
  CANCELLED: { label: 'cancelada', className: 'text-text-muted bg-soft-pink' },
};

export function publicationStatusStyle(status: string): StatusStyle {
  return PUBLICATION_STATUS_STYLES[status] ?? { label: status.toLowerCase(), className: 'text-text-muted bg-soft-pink' };
}

export const ACCOUNT_STATUS_STYLES: Record<string, StatusStyle> = {
  ACTIVE: { label: 'activa', className: 'text-mint bg-mint-soft' },
  INACTIVE: { label: 'inactiva', className: 'text-text-muted bg-soft-pink' },
};

export function accountStatusStyle(status: string): StatusStyle {
  return ACCOUNT_STATUS_STYLES[status] ?? { label: status.toLowerCase(), className: 'text-text-muted bg-soft-pink' };
}
