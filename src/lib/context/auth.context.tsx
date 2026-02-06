'use client';

import { useAuthStore, normalizeRole, type UserRole } from '@/stores/auth.store';

// Re-export the auth store as a hook that matches the expected interface
export function useAuth() {
  const { token, user, isAuthenticated, setAuth, logout } = useAuthStore();

  return {
    token,
    user,
    isAuthenticated,
    login: (token: string, user: { id: string; email: string; firstName: string; lastName: string; role: string; organizationId?: string }) => {
      // Normalize and cast the role for type safety
      const userWithTypedRole = {
        ...user,
        role: normalizeRole(user.role) as UserRole,
      };
      setAuth(token, userWithTypedRole);
    },
    logout,
  };
}

export { useAuthStore };
