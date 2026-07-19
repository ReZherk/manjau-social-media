import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/types/api';
import type {
  SocialAccountResponse,
  CreateSocialAccountRequest,
  UpdateSocialAccountRequest,
  RevealCredentialResponse,
} from '../types/socialAccountTypes';

export const socialAccountsApi = {
  findAll: (params: { search?: string; platform?: string; status?: string; page?: number; size?: number }) =>
    apiClient.get<PageResponse<SocialAccountResponse>>('/social-accounts', { params }),
  findById: (id: string) => apiClient.get<SocialAccountResponse>(`/social-accounts/${id}`),
  create: (data: CreateSocialAccountRequest) => apiClient.post<SocialAccountResponse>('/social-accounts', data),
  update: (id: string, data: UpdateSocialAccountRequest) => apiClient.put<SocialAccountResponse>(`/social-accounts/${id}`, data),
  changeStatus: (id: string, status: string) => apiClient.patch<SocialAccountResponse>(`/social-accounts/${id}/status`, { status }),
  reveal: (id: string) => apiClient.get<RevealCredentialResponse>(`/social-accounts/${id}/credentials`),
};
