import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { DeleteEmployeeModal } from '@/components/employees/DeleteEmployeeModal';
import { EmployeeInfoCard } from '@/components/employees/EmployeeInfoCard';
import { EmployeePermissionsPreview } from '@/components/employees/EmployeePermissionsPreview';
import { EmployeeProfileHeader } from '@/components/employees/EmployeeProfileHeader';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { loadEmployeeIntoDraft, useEmployeeDraftStore } from '@/store/employeeDraftStore';
import { useEmployeeStore } from '@/store/employeeStore';

export default function EmployeeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const employee = useEmployeeStore((s) => s.employees.find((e) => e.id === id));
  const removeEmployee = useEmployeeStore((s) => s.removeEmployee);
  const setMode = useEmployeeDraftStore((s) => s.setMode);

  const [showDelete, setShowDelete] = useState(false);

  if (!employee) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <EmployeeScreenHeader title="Employee Management" multiline={false} />
      </SafeAreaView>
    );
  }

  const startEdit = (target: 'profile' | 'password' | 'permissions') => {
    loadEmployeeIntoDraft(employee);
    setMode('edit', employee.id);

    if (target === 'profile') {
      router.push('/dashboard/employees/add' as Href);
    } else if (target === 'password') {
      router.push('/dashboard/employees/create-password' as Href);
    } else {
      router.push('/dashboard/employees/permissions' as Href);
    }
  };

  const handleDelete = () => {
    removeEmployee(employee.id);
    setShowDelete(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmployeeScreenHeader title="Employee Management" multiline={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EmployeeProfileHeader
          employee={employee}
          onEdit={() => startEdit('profile')}
          onDelete={() => setShowDelete(true)}
        />

        <EmployeeInfoCard
          title="EMPLOYEE DETAILS"
          rows={[
            { label: 'Name', value: employee.fullName },
            { label: 'Employee ID', value: employee.employeeId },
            { label: 'Designation', value: employee.designation },
            { label: 'Phone No.', value: `+91 ${employee.phone}` },
            { label: 'Email', value: employee.email },
          ]}
        />

        <EmployeeInfoCard
          title="PASSWORD MANAGER"
          actionLabel="Employee Password"
          actionValue={employee.password}
          onEdit={() => startEdit('password')}
        />

        <EmployeePermissionsPreview onEdit={() => startEdit('permissions')} />
      </ScrollView>

      <BottomNav activeRoute="home" />

      <DeleteEmployeeModal
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
});
