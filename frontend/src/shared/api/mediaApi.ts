import { apiClient } from '@/shared/api/client';

export interface MediaUploadResponse {
  fileUrl: string;
  mediaType: string | null;
  originalName: string | null;
}

export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<MediaUploadResponse>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
