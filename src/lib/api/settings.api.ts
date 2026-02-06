import { apiClient } from './client';

export interface OrganizationSettings {
  id: string;
  name: string;
  type: string;
  contactEmail: string;
  phone: string;
  address: string;
  logoUrl: string;
  settings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  weeklyReports: boolean;
  lowScoreAlerts: boolean;
  lowScoreThreshold: number;
}

export interface SystemInfo {
  version: string;
  environment: string;
  database: string;
  apiStatus: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

export interface UpdateNotificationInput {
  emailNotifications?: boolean;
  weeklyReports?: boolean;
  lowScoreAlerts?: boolean;
  lowScoreThreshold?: number;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const settingsApi = {
  // Get organization settings
  getOrganization: async (): Promise<OrganizationSettings> => {
    return apiClient.get<OrganizationSettings>('/settings/organization');
  },

  // Update organization settings (org_admin only)
  updateOrganization: async (input: UpdateOrganizationInput): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>('/settings/organization', input);
  },

  // Update notification settings (org_admin only)
  updateNotifications: async (input: UpdateNotificationInput): Promise<{ settings: NotificationSettings; message: string }> => {
    return apiClient.patch<{ settings: NotificationSettings; message: string }>('/settings/notifications', input);
  },

  // Change password
  changePassword: async (input: ChangePasswordInput): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/settings/change-password', input);
  },

  // Get system information
  getSystemInfo: async (): Promise<SystemInfo> => {
    return apiClient.get<SystemInfo>('/settings/system');
  },

  // Reset all training data (DANGER - org_admin only)
  resetData: async (confirmText: string): Promise<{ message: string; affectedTrainees: number }> => {
    return apiClient.delete<{ message: string; affectedTrainees: number }>('/settings/reset-data', {
      data: { confirmText },
    });
  },
};
