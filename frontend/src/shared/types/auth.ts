export interface Role {
  code: string;
  name: string;
}

export interface User {
  id: string;
  fullName: string;
  institutionalEmail: string;
  initials: string;
  role: Role;
  permissions: string[];
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  mustChangePassword: boolean;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}
