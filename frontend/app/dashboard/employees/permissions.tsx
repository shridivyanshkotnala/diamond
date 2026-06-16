import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { MatrixCheckboxRow } from '@/components/settings/MatrixCheckboxRow';
import { GOLD_MATRIX_SECTIONS } from '@/constants/dashboardMatrices';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useEmployeeDraftStore } from '@/store/employeeDraftStore';
import type { MatrixKey } from '@/constants/dashboardMatrices';

const BUTTON_GREEN = '#1B3022';
const ACCENT_GOLD = '#C5A059';

export default function EmployeePermissionsScreen() {
  const router = useRouter();
  const permissions = useEmployeeDraftStore((s) => s.draft.permissions);
  const togglePermission = useEmployeeDraftStore((s) => s.togglePermission);

  const toggle = (key: MatrixKey) => togglePermission(key);

  const handleContinue = () => {
    router.push('/dashboard/employees/permissions-extra' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmployeeScreenHeader title="Set Permissions" multiline={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard Matrices</Text>
          <Text style={styles.cardSubtitle}>Price visibility on home screen</Text>

          <View style={styles.goldHeader}>
            <View style={styles.goldDot} />
            <Text style={styles.goldHeaderText}>GOLD BREAKDOWNS</Text>
          </View>

          {GOLD_MATRIX_SECTIONS.map((section) => (
            <View key={section.sectionLabel} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.sectionLabel}</Text>
              </View>
              {section.rows.map((row, index) => (
                <MatrixCheckboxRow
                  key={row.key}
                  label={row.label}
                  checked={permissions[row.key]}
                  onToggle={() => toggle(row.key)}
                  showDivider={index < section.rows.length - 1}
                />
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleContinue} style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  goldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    gap: 8,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_GOLD,
  },
  goldHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT_GOLD,
    letterSpacing: 0.6,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  continueBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
