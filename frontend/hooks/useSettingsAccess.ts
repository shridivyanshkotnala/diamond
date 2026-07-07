import { useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';

import { getVisibleSettingsMenuItems, resolveCurrentEmployee, canAccessSettingsItem } from '@/utils/settingsAccess';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';

export function useSettingsAccess() {
  const userRole = useAuthStore((state) => state.userRole);
  const isSuper = useAuthStore((state) => state.isSuper);
  const loggedInEmployeeId = useAuthStore((state) => state.loggedInEmployeeId);
  const savedPhone = useAuthStore((state) => state.savedPhone);
  const employees = useEmployeeStore((state) => state.employees);

  const employee = useMemo(
    () => resolveCurrentEmployee(employees, loggedInEmployeeId, savedPhone),
    [employees, loggedInEmployeeId, savedPhone],
  );

  const visibleMenuItems = useMemo(
    () => getVisibleSettingsMenuItems(userRole, employee?.permissions, isSuper),
    [userRole, employee?.permissions],
  );

  const canAccess = (itemId: string) =>
    canAccessSettingsItem(itemId, userRole, employee?.permissions);

  return {
    userRole,
    employee,
    visibleMenuItems,
    canAccessSettingsItem: canAccess,
    isOwner: userRole === 'business',
    isEmployee: userRole === 'employee',
  };
}

export function useRequireSettingsAccess(settingsItemId: string) {
  const router = useRouter();
  const { canAccessSettingsItem } = useSettingsAccess();
  const allowed = canAccessSettingsItem(settingsItemId);

  useEffect(() => {
    if (!allowed) {
      router.replace('/dashboard/settings');
    }
  }, [allowed, router]);

  return allowed;
}
