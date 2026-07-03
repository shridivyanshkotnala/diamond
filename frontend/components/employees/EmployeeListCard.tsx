import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import type { Employee } from '@/types/employee';

const ACCENT_GOLD = '#C5A059';

interface EmployeeListCardProps {
  employee: Employee;
  onPress: () => void;
}

export function EmployeeListCard({ employee, onPress }: EmployeeListCardProps) {
  const nameParts = employee.fullName.trim().split(/\s+/);
  const initial = nameParts.length > 1 
    ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
    : employee.fullName.charAt(0).toUpperCase();

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{employee.fullName}</Text>
        <Text style={styles.role}>{employee.designation}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{employee.employeeId}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  role: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: ACCENT_GOLD,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: 110,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
});
