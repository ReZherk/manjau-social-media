import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

let refreshRequest: Promise<string> | null = null;

function clearSession() {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRequest = original?.url?.startsWith('/auth/');
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRequest && refreshToken) {
      original._retry = true;
      try {
        refreshRequest ??= refreshClient.post('/auth/refresh', { refreshToken }).then(({ data }) => {
          sessionStorage.setItem('accessToken', data.accessToken);
          sessionStorage.setItem('refreshToken', data.refreshToken);
          if (data.user) sessionStorage.setItem('user', JSON.stringify(data.user));
          return data.accessToken as string;
        }).finally(() => { refreshRequest = null; });
        const accessToken = await refreshRequest;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        clearSession();
        window.location.href = '/login';
      }
    } else if (error.response?.status === 401) {
      clearSession();
      if (!isAuthRequest) window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export { apiClient };
