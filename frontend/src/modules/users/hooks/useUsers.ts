import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { UserFilters } from '../types/userTypes';

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () =>
      usersApi.findAll({
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        page: filters.page,
        size: filters.size,
      }),
    placeholderData: (prev) => prev,
  });
}
