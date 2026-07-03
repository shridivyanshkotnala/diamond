import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SquarePen, Trash2 } from 'lucide-react-native';

import { Colors, Radius } from '@/constants/theme';
import type { Employee } from '@/types/employee';

const DELETE_RED = '#EA4335';

interface EmployeeProfileHeaderProps {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}

export function EmployeeProfileHeader({ employee, onEdit, onDelete }: EmployeeProfileHeaderProps) {
  const nameParts = employee.fullName.trim().split(/\s+/);
  const initial = nameParts.length > 1 
    ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
    : employee.fullName.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.name}>{employee.fullName}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}>
          <SquarePen size={18} color={Colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.iconBtn}>
          <Trash2 size={18} color={DELETE_RED} />
        </Pressable>
      </View>
    </View>
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
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
