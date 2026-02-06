'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useSuperAdminApi() {
  const token = useAuthStore((state) => state.token);

  const fetchApi = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

      const response = await fetch(`${API_BASE}/super-admin${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    [token]
  );

  return {
    // Dashboard
    getDashboard: () => fetchApi<PlatformOverview>('/dashboard'),

    // Organizations
    getOrganizations: (params?: OrganizationParams) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return fetchApi<PaginatedResult<OrganizationSummary>>(`/organizations${query ? `?${query}` : ''}`);
    },

    getOrganization: (id: string) => fetchApi<OrganizationDetails>(`/organizations/${id}`),

    createOrganization: (data: CreateOrgInput) =>
      fetchApi<OrganizationDetails>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateOrganizationStatus: (id: string, data: UpdateOrgStatusInput) =>
      fetchApi<OrganizationDetails>(`/organizations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    impersonateOrganization: (id: string) =>
      fetchApi<ImpersonationToken>(`/organizations/${id}/impersonate`, {
        method: 'POST',
      }),

    // Plans
    getPlans: async (): Promise<SubscriptionPlan[]> => {
      const response = await fetchApi<{ plans: SubscriptionPlan[] }>('/plans');
      // Parse features from JSON string to array
      return (response.plans || []).map(plan => ({
        ...plan,
        features: typeof plan.features === 'string'
          ? JSON.parse(plan.features || '[]')
          : (plan.features || []),
      }));
    },

    createPlan: (data: CreatePlanInput) =>
      fetchApi<SubscriptionPlan>('/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updatePlan: (id: string, data: UpdatePlanInput) =>
      fetchApi<SubscriptionPlan>(`/plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    // Subscriptions
    assignSubscription: (orgId: string, data: AssignSubscriptionInput) =>
      fetchApi<SubscriptionDetails>(`/organizations/${orgId}/subscription`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateSubscription: (orgId: string, data: Partial<AssignSubscriptionInput>) =>
      fetchApi<SubscriptionDetails>(`/organizations/${orgId}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    cancelSubscription: (orgId: string) =>
      fetchApi<void>(`/organizations/${orgId}/subscription`, {
        method: 'DELETE',
      }),

    // Analytics
    getRevenueMetrics: (period?: string) =>
      fetchApi<RevenueMetrics>(`/revenue${period ? `?period=${period}` : ''}`),

    getApiUsageMetrics: (params?: { period?: string; organizationId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return fetchApi<ApiUsageMetrics>(`/api-usage${query ? `?${query}` : ''}`);
    },

    // Users
    searchUsers: (params?: UserSearchParams) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return fetchApi<PaginatedResult<UserSummary>>(`/users${query ? `?${query}` : ''}`);
    },

    getUserDetails: (id: string) => fetchApi<UserDetails>(`/users/${id}`),

    // Audit Logs
    getAuditLogs: (params?: AuditLogParams) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return fetchApi<PaginatedResult<AuditLogEntry>>(`/audit-logs${query ? `?${query}` : ''}`);
    },
  };
}

// Types
export interface PlatformOverview {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsersLast30Days: number;
  totalSimulations: number;
  totalVoiceSessions: number;
  mrr: number;
  arr: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'org_created' | 'subscription_updated' | 'user_registered' | 'org_suspended';
  description: string;
  targetId: string;
  targetName: string;
  createdAt: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  contactEmail: string | null;
  userCount: number;
  activeUserCount: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  lastActivityAt: string | null;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  activeUserCount: number;
  trainerCount: number;
  traineeCount: number;
  groupCount: number;
  totalSimulations: number;
  totalVoiceSessions: number;
  subscription: SubscriptionDetails | null;
  recentUsers: UserSummary[];
  usageStats: UsageStats;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    displayName: string;
    monthlyPrice: number;
    seatLimit: number | null;
  };
}

export interface UsageStats {
  simulationsThisMonth: number;
  voiceMinutesThisMonth: number;
  apiCostThisMonth: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  seatLimit: number | null;
  simulationLimit: number | null;
  voiceMinutesLimit: number | null;
  features: string[];
  isActive: boolean;
  subscriberCount?: number;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  organizationId: string;
  organizationName: string;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface UserDetails extends UserSummary {
  completedSimulations: number;
  totalVoiceSessions: number;
  averageScore: number | null;
  groupMemberships: { groupId: string; groupName: string }[];
}

export interface RevenueMetrics {
  currentMRR: number;
  previousMRR: number;
  mrrGrowth: number;
  mrrGrowthPercent: number;
  arr: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  churnRate: number;
  revenueByPlan: PlanRevenue[];
  revenueByMonth: MonthlyRevenue[];
}

export interface PlanRevenue {
  planId: string;
  planName: string;
  displayName: string;
  revenue: number;
  count: number;
  percentOfTotal: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  subscriptionCount: number;
}

export interface ApiUsageMetrics {
  totalCost: number;
  totalRequests: number;
  costByProvider: ProviderCost[];
  costByOrganization: OrgCost[];
  dailyUsage: DailyUsage[];
}

export interface ProviderCost {
  provider: string;
  cost: number;
  requests: number;
  percentOfTotal: number;
}

export interface OrgCost {
  orgId: string;
  orgName: string;
  cost: number;
  requests: number;
}

export interface DailyUsage {
  date: string;
  cost: number;
  requests: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CreateOrgInput {
  name: string;
  type: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

export interface UpdateOrgStatusInput {
  status: 'active' | 'suspended' | 'blocked';
  reason?: string;
}

export interface CreatePlanInput {
  name: string;
  displayName: string;
  description?: string;
  monthlyPrice: number;
  annualPrice?: number;
  seatLimit?: number;
  simulationLimit?: number;
  voiceMinutesLimit?: number;
  features?: string[];
}

export interface UpdatePlanInput {
  displayName?: string;
  description?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  seatLimit?: number;
  simulationLimit?: number;
  voiceMinutesLimit?: number;
  features?: string[];
  isActive?: boolean;
}

export interface AssignSubscriptionInput {
  planId: string;
  billingCycle: 'monthly' | 'annual';
  status?: 'active' | 'trial';
  startDate?: string;
}

export interface ImpersonationToken {
  token: string;
  expiresIn: number;
  organizationId: string;
  organizationName: string;
}

export interface OrganizationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UserSearchParams {
  query?: string;
  organizationId?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogParams {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
