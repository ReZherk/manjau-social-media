import { apiClient } from '@/shared/api/client';

export interface ReferenceItem {
  id: string;
  code: string;
  name: string;
}

export const referenceApi = {
  getPlatforms: () => apiClient.get<ReferenceItem[]>('/platforms'),
  getContentTypes: () => apiClient.get<ReferenceItem[]>('/content-types'),
};
