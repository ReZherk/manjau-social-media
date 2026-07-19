export interface SocialAccountResponse {
  id: string;
  platformCode: string;
  platformName: string;
  accountName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateSocialAccountRequest {
  platformCode: string;
  accountName: string;
  accessUsername: string;
  accessSecret: string;
}

export interface UpdateSocialAccountRequest {
  platformCode: string;
  accountName: string;
  accessUsername?: string;
  accessSecret?: string;
}

export interface RevealCredentialResponse {
  accessUsername: string;
  accessSecret: string;
}

export interface SocialAccountFilters {
  search: string;
  platform: string;
  status: string;
  page: number;
  size: number;
}
