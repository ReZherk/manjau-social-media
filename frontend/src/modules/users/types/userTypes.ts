export interface UserResponse {
  id: string;
  dni: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  institutionalEmail: string;
  initials: string;
  role: { code: string; name: string };
  status: 'ACTIVE' | 'INACTIVE';
  lastAccessAt: string | null;
  createdAt: string;
}

export interface CreateUserRequest {
  dni: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  institutionalEmail: string;
  roleCode: string;
}

export interface UpdateUserRequest {
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  institutionalEmail: string;
  roleCode: string;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
}
