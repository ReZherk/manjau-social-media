import { useQuery } from '@tanstack/react-query';
import { referenceApi } from '@/shared/api/referenceApi';

const HOUR = 60 * 60 * 1000;

export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: () => referenceApi.getPlatforms(),
    staleTime: HOUR,
  });
}

export function useContentTypes() {
  return useQuery({
    queryKey: ['content-types'],
    queryFn: () => referenceApi.getContentTypes(),
    staleTime: HOUR,
  });
}
