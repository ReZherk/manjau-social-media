import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metricsApi';
import type { MetricFilters } from '../types/metricTypes';
export const useMetrics = (filters: MetricFilters) => useQuery({ queryKey: ['metrics', filters], queryFn: () => metricsApi.list(filters), placeholderData: p => p });
export const useAnalystDashboard = () => useQuery({ queryKey: ['analyst-dashboard'], queryFn: async () => (await metricsApi.dashboard()).data });
