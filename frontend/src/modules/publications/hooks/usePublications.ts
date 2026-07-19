import { useQuery } from '@tanstack/react-query';
import { publicationsApi } from '../api/publicationsApi';
import type { PublicationFilters } from '../types/publicationTypes';

function toParams(filters: PublicationFilters) {
  return {
    search: filters.search || undefined,
    from: filters.from ? new Date(filters.from).toISOString() : undefined,
    to: filters.to ? new Date(filters.to + 'T23:59:59').toISOString() : undefined,
    page: filters.page,
    size: filters.size,
  };
}

export function useScheduledPublications(filters: PublicationFilters) {
  return useQuery({
    queryKey: ['publications', 'scheduled', filters],
    queryFn: () => publicationsApi.scheduled(toParams(filters)),
    placeholderData: (prev) => prev,
  });
}

export function useHistoryPublications(filters: PublicationFilters) {
  return useQuery({
    queryKey: ['publications', 'history', filters],
    queryFn: () => publicationsApi.history(toParams(filters)),
    placeholderData: (prev) => prev,
  });
}
