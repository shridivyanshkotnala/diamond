import { Pressable, StyleSheet, Text } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

import { Colors, Radius } from '@/constants/theme';

const BUTTON_GREEN = '#1B3022';

interface EmployeeFabProps {
  onPress: () => void;
  variant?: 'primary' | 'muted';
  label?: string;
}

export function EmployeeFab({
  onPress,
  variant = 'primary',
  label = 'Add New Employee',
}: EmployeeFabProps) {
  const isMuted = variant === 'muted';

  return (
    <Pressable onPress={onPress} style={[styles.fab, isMuted && styles.fabMuted]}>
      <PlusCircle size={18} color={isMuted ? Colors.textSecondary : Colors.white} />
      <Text style={[styles.label, isMuted && styles.labelMuted]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  fabMuted: {
    backgroundColor: '#E8E8E8',
    shadowOpacity: 0.04,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  labelMuted: {
    color: Colors.textPrimary,
  },
});
