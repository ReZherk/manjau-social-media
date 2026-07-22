export interface MetricPublication {
  publicationId: string; title: string; contentTypeName: string; budget: number | null; publishedAt: string;
  socialAccountId: string; platformCode: string; platformName: string; accountName: string;
  registrationStatus: 'PENDING' | 'REGISTERED'; metricId: string | null;
  reactions: number; reach: number; saves: number; shares: number; comments: number; updatedAt: string | null;
}
export interface MetricRequest { publicationId: string; socialAccountId: string; reactions: number; reach: number; saves: number; shares: number; comments: number; }
export interface MetricFilters { search: string; from: string; to: string; status: string; platform: string; page: number; size: number; }
export interface AnalystDashboard { socialAccounts: number; publishedTargets: number; registeredMetrics: number; pendingMetrics: number; }
export interface ContentTypeBreakdown { contentType: string; publications: number; reactions: number; reach: number; saves: number; shares: number; comments: number; }
export interface ReportPlatform { code: string; name: string; publications: number; reactions: number; reach: number; saves: number; shares: number; comments: number; budget: number; engagementRate: number; avgReach: number; costPerInteraction: number; contentTypes: ContentTypeBreakdown[]; }
export interface PerformanceReport { from: string; to: string; publications: number; registeredMetrics: number; reactions: number; reach: number; saves: number; shares: number; comments: number; budget: number; engagementRate: number; avgReach: number; costPerInteraction: number; platforms: ReportPlatform[]; }
