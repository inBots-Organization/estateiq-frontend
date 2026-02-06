'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { adminApi, RoleInfo } from '@/lib/api/admin.api';
import { useAuthStore } from '@/stores/auth.store';

interface AdminRoleContextValue {
  roleInfo: RoleInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isTrainer: boolean;
  isOrgAdmin: boolean;
  permissions: RoleInfo['permissions'] | null;
}

const AdminRoleContext = createContext<AdminRoleContextValue | null>(null);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuthStore();
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoleInfo = useCallback(async () => {
    if (!token || !user) {
      setRoleInfo(null);
      setLoading(false);
      return;
    }

    // Only fetch for admin-level users
    if (user.role !== 'org_admin' && user.role !== 'trainer') {
      setRoleInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await adminApi.getRoleInfo();
      setRoleInfo(info);
    } catch (err) {
      console.error('Failed to fetch role info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role info');
      // Fallback based on auth store user
      setRoleInfo({
        role: user.role,
        isTrainer: user.role === 'trainer',
        isOrgAdmin: user.role === 'org_admin',
        organizationId: user.organizationId || '',
        permissions: {
          canViewAllEmployees: user.role === 'org_admin',
          canCreateGroups: user.role === 'org_admin',
          canDeleteGroups: user.role === 'org_admin',
          canManageTrainers: user.role === 'org_admin',
          canManageAdmins: user.role === 'org_admin',
          canViewOrgWideStats: user.role === 'org_admin',
          canModifyEmployees: user.role === 'org_admin',
        },
      });
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchRoleInfo();
  }, [fetchRoleInfo]);

  const value: AdminRoleContextValue = {
    roleInfo,
    loading,
    error,
    refresh: fetchRoleInfo,
    isTrainer: roleInfo?.isTrainer ?? user?.role === 'trainer',
    isOrgAdmin: roleInfo?.isOrgAdmin ?? user?.role === 'org_admin',
    permissions: roleInfo?.permissions ?? null,
  };

  return (
    <AdminRoleContext.Provider value={value}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) {
    throw new Error('useAdminRole must be used within AdminRoleProvider');
  }
  return context;
}

// Hook that provides safe defaults if not in AdminRoleProvider
export function useAdminRoleSafe(): AdminRoleContextValue {
  const context = useContext(AdminRoleContext);
  const { user } = useAuthStore();

  if (context) {
    return context;
  }

  // Return safe defaults
  return {
    roleInfo: null,
    loading: false,
    error: null,
    refresh: async () => {},
    isTrainer: user?.role === 'trainer',
    isOrgAdmin: user?.role === 'org_admin',
    permissions: user?.role === 'org_admin' ? {
      canViewAllEmployees: true,
      canCreateGroups: true,
      canDeleteGroups: true,
      canManageTrainers: true,
      canManageAdmins: true,
      canViewOrgWideStats: true,
      canModifyEmployees: true,
    } : {
      canViewAllEmployees: false,
      canCreateGroups: false,
      canDeleteGroups: false,
      canManageTrainers: false,
      canManageAdmins: false,
      canViewOrgWideStats: false,
      canModifyEmployees: false,
    },
  };
}
