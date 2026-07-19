import { useQuery } from '@tanstack/react-query';
import { socialAccountsApi } from '../api/socialAccountsApi';
import type { SocialAccountFilters } from '../types/socialAccountTypes';

export function useSocialAccounts(filters: SocialAccountFilters) {
  return useQuery({
    queryKey: ['social-accounts', filters],
    queryFn: () =>
      socialAccountsApi.findAll({
        search: filters.search || undefined,
        platform: filters.platform || undefined,
        status: filters.status || undefined,
        page: filters.page,
        size: filters.size,
      }),
    placeholderData: (prev) => prev,
  });
}
