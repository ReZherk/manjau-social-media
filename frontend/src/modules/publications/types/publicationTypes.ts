export interface PublicationTargetAccount {
  id: string;
  platformCode: string;
  platformName: string;
  accountName: string;
}

export interface PublicationMedia {
  id: string;
  fileUrl: string;
  mediaType: string | null;
}

export interface PublicationResponse {
  id: string;
  title: string;
  description: string | null;
  additionalInfo: string | null;
  budget: number | null;
  contentTypeCode: string;
  contentTypeName: string;
  status: 'SCHEDULED' | 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  scheduledAt: string;
  publishedAt: string | null;
  evidenceLink: string | null;
  createdAt: string;
  targetAccounts: PublicationTargetAccount[];
  media: PublicationMedia[];
}

export interface MediaInput {
  fileUrl: string;
  mediaType?: string;
}

export interface CreatePublicationRequest {
  title: string;
  description?: string;
  additionalInfo?: string;
  budget?: number;
  contentTypeCode: string;
  scheduledAt: string;
  socialAccountIds: string[];
  media?: MediaInput[];
  draft?: boolean;
}

export type UpdatePublicationRequest = CreatePublicationRequest;

export interface MarkPublishedRequest {
  evidenceLink: string;
}

export interface PublicationFilters {
  search: string;
  from: string;
  to: string;
  page: number;
  size: number;
}
