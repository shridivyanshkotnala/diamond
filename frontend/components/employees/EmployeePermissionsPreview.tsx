import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, SquarePen } from 'lucide-react-native';

import { Colors, Radius } from '@/constants/theme';

const ACCENT_GOLD = '#C5A059';

interface EmployeePermissionsPreviewProps {
  onEdit: () => void;
}

export function EmployeePermissionsPreview({ onEdit }: EmployeePermissionsPreviewProps) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onEdit} style={styles.permissionsHeader}>
        <Text style={styles.permissionsTitle}>Employee Permissions</Text>
        <SquarePen size={16} color={Colors.textPrimary} />
      </Pressable>

      <View style={styles.matricesSection}>
        <Text style={styles.matricesTitle}>Dashboard Matrices</Text>
        <Text style={styles.matricesSubtitle}>Price visibility on home screen</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>24K With Tax</Text>
          <View style={styles.checkbox}>
            <Check size={14} color={Colors.white} strokeWidth={3} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  permissionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  matricesSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  matricesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  matricesSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: ACCENT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
