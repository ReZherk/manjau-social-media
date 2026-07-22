import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/types/api';
import type { AnalystDashboard, MetricFilters, MetricPublication, MetricRequest, PerformanceReport } from '../types/metricTypes';

const params = (f: MetricFilters) => ({ ...f, search: f.search || undefined, platform: f.platform || undefined,
  status: f.status || undefined, from: f.from ? new Date(`${f.from}T00:00:00`).toISOString() : undefined,
  to: f.to ? new Date(`${f.to}T23:59:59`).toISOString() : undefined });
export const metricsApi = {
  list: (filters: MetricFilters) => apiClient.get<PageResponse<MetricPublication>>('/metrics/publications', { params: params(filters) }),
  create: (data: MetricRequest) => apiClient.post<MetricPublication>('/metrics', data),
  update: (id: string, data: MetricRequest) => apiClient.put<MetricPublication>(`/metrics/${id}`, data),
  dashboard: () => apiClient.get<AnalystDashboard>('/analyst/dashboard'),
  report: (from: string, to: string, platforms: string[]) => apiClient.get<PerformanceReport>('/reports/performance', { params: {
    from: new Date(`${from}T00:00:00`).toISOString(), to: new Date(`${to}T23:59:59`).toISOString(), platforms,
  }, paramsSerializer: { indexes: null } }),
};
