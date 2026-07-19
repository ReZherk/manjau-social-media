import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles(),
  });
}
