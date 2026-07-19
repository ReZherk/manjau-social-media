import { apiClient } from '@/shared/api/client';
import type { UserResponse, CreateUserRequest, UpdateUserRequest, PageResponse, RoleResponse } from '../types/userTypes';

export const usersApi = {
  findAll: (params: { search?: string; role?: string; status?: string; page?: number; size?: number }) =>
    apiClient.get<PageResponse<UserResponse>>('/users', { params }),
  findById: (id: string) => apiClient.get<UserResponse>(`/users/${id}`),
  create: (data: CreateUserRequest) => apiClient.post<UserResponse>('/users', data),
  update: (id: string, data: UpdateUserRequest) => apiClient.put<UserResponse>(`/users/${id}`, data),
  changeStatus: (id: string, status: string) => apiClient.patch<UserResponse>(`/users/${id}/status`, { status }),
  resetCredentials: (id: string) => apiClient.post(`/users/${id}/reset-credentials`),
  getRoles: () => apiClient.get<RoleResponse[]>('/roles/assignable'),
};
