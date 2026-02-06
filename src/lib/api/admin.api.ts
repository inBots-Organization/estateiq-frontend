import { apiClient } from './client';

// Types
export interface RoleInfo {
  role: string;
  isTrainer: boolean;
  isOrgAdmin: boolean;
  organizationId: string;
  permissions: {
    canViewAllEmployees: boolean;
    canCreateGroups: boolean;
    canDeleteGroups: boolean;
    canManageTrainers: boolean;
    canManageAdmins: boolean;
    canViewOrgWideStats: boolean;
    canModifyEmployees: boolean;
  };
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    averageSessionsPerUser: number;
  };
  teamPerformance: {
    bestPerformer: {
      id: string;
      name: string;
      email: string;
      averageScore: number;
      totalSessions: number;
    } | null;
    worstPerformer: {
      id: string;
      name: string;
      email: string;
      averageScore: number;
      totalSessions: number;
    } | null;
    averageTeamScore: number;
  };
  monthlyTrends: Array<{
    month: string;
    year: number;
    averageScore: number;
    totalSessions: number;
    activeUsers: number;
  }>;
  recentActivity: Array<{
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
  userRole: string;
  isTrainerView: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  lastActivityAt: string | null;
  createdAt: string;
  status: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
  isTrainerView: boolean;
}

export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface GroupTrainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  members: GroupMember[];
  trainers: GroupTrainer[];
  createdAt: string;
}

export interface GroupsResponse {
  groups: Group[];
  isTrainerView: boolean;
  canCreateGroups: boolean;
  canDeleteGroups: boolean;
}

// API Functions
export const adminApi = {
  // Get role info and permissions
  getRoleInfo: () => apiClient.get<RoleInfo>('/admin/role-info'),

  // Dashboard
  getDashboard: () => apiClient.get<AdminDashboard>('/admin/dashboard'),

  getOverview: () =>
    apiClient.get<AdminDashboard['overview']>('/admin/overview'),

  getTeamPerformance: () =>
    apiClient.get<AdminDashboard['teamPerformance']>('/admin/team-performance'),

  getTrends: (months = 6) =>
    apiClient.get<AdminDashboard['monthlyTrends']>('/admin/trends', {
      months: months.toString(),
    }),

  // Employees
  getEmployees: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
    return apiClient.get<EmployeeListResponse>('/admin/employees', queryParams);
  },

  getEmployee: (id: string) =>
    apiClient.get<Employee>(`/admin/employees/${id}`),

  createEmployee: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    groupId?: string;
  }) => apiClient.post<{ message: string; employee: Employee }>('/admin/employees', data),

  updateEmployee: (
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; role?: string }
  ) => apiClient.patch<Employee>(`/admin/employees/${id}`, data),

  updateEmployeeStatus: (id: string, status: 'active' | 'suspended', reason?: string) =>
    apiClient.patch<Employee>(`/admin/employees/${id}/status`, { status, reason }),

  deleteEmployee: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/employees/${id}`),

  // Groups
  getGroups: () => apiClient.get<GroupsResponse>('/admin/groups'),

  // Voice Sessions
  getVoiceSessions: (params?: { page?: number; limit?: number }) => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    return apiClient.get<{
      sessions: Array<{
        id: string;
        conversationId: string;
        traineeId: string;
        traineeName: string;
        traineeEmail: string;
        startTime: string;
        endTime: string | null;
        duration: number;
        overallScore: number;
        status: string;
        hasAudio: boolean;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>('/admin/voice-sessions', queryParams);
  },

  getTraineeVoiceSessions: (traineeId: string) =>
    apiClient.get<{
      sessions: Array<{
        id: string;
        conversationId: string;
        traineeId: string;
        startTime: string;
        endTime: string | null;
        duration: number;
        durationSeconds: number;
        overallScore: number;
        status: string;
        analysis: unknown;
        transcript: unknown;
        hasAudio: boolean;
      }>;
    }>(`/admin/trainee/${traineeId}/voice-sessions`),

  getTraineeSimulations: (traineeId: string) =>
    apiClient.get<{
      sessions: Array<{
        id: string;
        traineeId: string;
        scenarioType: string;
        difficultyLevel: string;
        status: string;
        startedAt: string;
        completedAt: string | null;
        durationSeconds: number | null;
        outcome: string | null;
        metrics: unknown;
        conversationTurns: Array<{
          id: string;
          speaker: string;
          message: string;
          timestamp: string;
          sentiment: string | null;
        }>;
      }>;
    }>(`/admin/trainee/${traineeId}/simulations`),

  getTraineeReports: (traineeId: string) =>
    apiClient.get<{
      traineeId: string;
      firstName: string;
      lastName: string;
      email: string;
    }>(`/admin/trainee/${traineeId}/reports`),
};
