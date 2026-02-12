'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, normalizeRole, type UserRole } from '@/stores/auth.store';
import { authApi, type LoginInput, type RegisterInput } from '@/lib/api/auth.api';

export function useAuth() {
  const router = useRouter();
  const { token, user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (input: LoginInput) => {
    const result = await authApi.login(input);
    // The setAuth function normalizes the role internally, but we cast for TypeScript
    // Include all user data including assignedTeacher, assignedTeacherId, currentSkillLevel
    const userWithTypedRole = {
      ...result.user,
      role: normalizeRole(result.user.role) as UserRole,
      assignedTeacher: result.user.assignedTeacher || null,
      assignedTeacherId: result.user.assignedTeacherId || null,
      currentSkillLevel: result.user.currentSkillLevel || null,
      assignedTeacherAvatar: result.user.assignedTeacherAvatar || null,
      assignedTeacherDisplayNameAr: result.user.assignedTeacherDisplayNameAr || null,
      assignedTeacherDisplayNameEn: result.user.assignedTeacherDisplayNameEn || null,
      assignedTeacherVoiceId: result.user.assignedTeacherVoiceId || null,
    };
    setAuth(result.accessToken, userWithTypedRole);
    // Redirect based on role
    const role = userWithTypedRole.role;
    if (role === 'saas_super_admin') {
      router.push('/super-admin');
    } else if (role === 'org_admin' || role === 'trainer') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    return result;
  }, [setAuth, router]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input);
    // The setAuth function normalizes the role internally, but we cast for TypeScript
    // New users won't have assigned teacher yet
    const userWithTypedRole = {
      ...result.user,
      role: normalizeRole(result.user.role) as UserRole,
      assignedTeacher: result.user.assignedTeacher || null,
      assignedTeacherId: result.user.assignedTeacherId || null,
      currentSkillLevel: result.user.currentSkillLevel || null,
      assignedTeacherAvatar: result.user.assignedTeacherAvatar || null,
      assignedTeacherDisplayNameAr: result.user.assignedTeacherDisplayNameAr || null,
      assignedTeacherDisplayNameEn: result.user.assignedTeacherDisplayNameEn || null,
      assignedTeacherVoiceId: result.user.assignedTeacherVoiceId || null,
    };
    setAuth(result.accessToken, userWithTypedRole);
    // New organization creators (org_admin) go to admin, trainees go to dashboard
    const role = userWithTypedRole.role;
    if (role === 'saas_super_admin') {
      router.push('/super-admin');
    } else if (role === 'org_admin' || role === 'trainer') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    return result;
  }, [setAuth, router]);

  const logout = useCallback(() => {
    storeLogout();
    router.push('/login');
  }, [storeLogout, router]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  }, []);

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
  };
}
