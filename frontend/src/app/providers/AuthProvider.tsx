import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { apiClient } from '@/shared/api/client';
import type { User, LoginRequest, LoginResponse } from '@/shared/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() ?? '?';
  const first = parts[0]?.charAt(0).toUpperCase() ?? '';
  const last = parts[parts.length - 1]?.charAt(0).toUpperCase() ?? '';
  return `${first}${last}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      const loginData = response.data;
      loginData.user.initials = getInitials(loginData.user.fullName);
      sessionStorage.setItem('accessToken', loginData.accessToken);
      sessionStorage.setItem('refreshToken', loginData.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(loginData.user));
      setUser(loginData.user);
      return loginData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', { refreshToken: sessionStorage.getItem('refreshToken') });
    } catch {
      // ignore
    }
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<LoginResponse['user']>('/auth/me');
      response.data.initials = getInitials(response.data.fullName);
      sessionStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    } catch {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return user?.permissions?.includes(permission) ?? false;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
