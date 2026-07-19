import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/types/api';
import type {
  PublicationResponse,
  CreatePublicationRequest,
  UpdatePublicationRequest,
  MarkPublishedRequest,
} from '../types/publicationTypes';

type ListParams = { search?: string; from?: string; to?: string; page?: number; size?: number };

export const publicationsApi = {
  scheduled: (params: ListParams) =>
    apiClient.get<PageResponse<PublicationResponse>>('/publications/scheduled', { params }),
  history: (params: ListParams) =>
    apiClient.get<PageResponse<PublicationResponse>>('/publications/history', { params }),
  findById: (id: string) => apiClient.get<PublicationResponse>(`/publications/${id}`),
  create: (data: CreatePublicationRequest) => apiClient.post<PublicationResponse>('/publications', data),
  update: (id: string, data: UpdatePublicationRequest) => apiClient.put<PublicationResponse>(`/publications/${id}`, data),
  remove: (id: string) => apiClient.delete(`/publications/${id}`),
  publish: (id: string, data: MarkPublishedRequest) => apiClient.post<PublicationResponse>(`/publications/${id}/publish`, data),
};
