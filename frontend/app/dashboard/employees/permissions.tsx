import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { MatrixCheckboxRow } from '@/components/settings/MatrixCheckboxRow';
import { GOLD_MATRIX_SECTIONS } from '@/constants/dashboardMatrices';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useEmployeeDraftStore } from '@/store/employeeDraftStore';
import { useEmployeeStore } from '@/store/employeeStore';
import type { EmployeePermissionKey } from '@/types/employee';
import type { MatrixKey } from '@/constants/dashboardMatrices';
import { buildEmployeeDraftPayload, createEmployeeDraft, updateEmployeeApi } from '@/utils/employeeApi';

const BUTTON_GREEN = '#1B3022';
const ACCENT_GOLD = '#C5A059';

export default function EmployeePermissionsScreen() {
  const router = useRouter();
  const draft = useEmployeeDraftStore((s) => s.draft);
  const permissions = draft.permissions;
  const togglePermission = useEmployeeDraftStore((s) => s.togglePermission);
  const mode = useEmployeeDraftStore((s) => s.mode);
  const editEmployeeId = useEmployeeDraftStore((s) => s.editEmployeeId);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggle = (key: EmployeePermissionKey) => togglePermission(key);

  const handleContinue = async () => {
    setFormError(null);

    if (mode === 'edit' && editEmployeeId) {
      setSaving(true);
      try {
        const result = await updateEmployeeApi(editEmployeeId, {
          name: draft.fullName,
          phone: draft.phone,
          email: draft.email,
          permissions: permissions,
        });
        
        if (!result.success) {
          setFormError(result.error ?? 'Failed to update employee.');
          return;
        }

        updateEmployee(editEmployeeId, { permissions: { ...permissions } });
        router.replace(`/dashboard/employees/${editEmployeeId}` as Href);
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const result = await createEmployeeDraft(buildEmployeeDraftPayload(draft));
      if (!result.success) {
        setFormError(result.error ?? 'Failed to save employee draft.');
        return;
      }
      router.push('/dashboard/employees/create-password' as Href);
    } finally {
      setSaving(false);
    }
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

        <View style={styles.permissionCard}>
          <Text style={styles.cardTitle}>Give Rate Edit Access</Text>
          <Text style={styles.cardSubtitle}>Allow employee to edit market rates</Text>
          
          <MatrixCheckboxRow
            label="Gold Rate"
            checked={permissions.edit_rate_gold}
            onToggle={() => toggle('edit_rate_gold')}
            showDivider
          />
          <MatrixCheckboxRow
            label="Diamond Rate"
            checked={permissions.edit_rate_diamond}
            onToggle={() => toggle('edit_rate_diamond')}
            showDivider
          />
          <MatrixCheckboxRow
            label="Colorstone Rate"
            checked={permissions.edit_rate_colorstone}
            onToggle={() => toggle('edit_rate_colorstone')}
            showDivider
          />
          <MatrixCheckboxRow
            label="Labour Charges"
            checked={permissions.edit_rate_labour}
            onToggle={() => toggle('edit_rate_labour')}
            showDivider={false}
          />
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.cardTitle}>Formula Edit Access</Text>
          <Text style={styles.cardSubtitle}>Allow employee to edit calculation formulas</Text>
          <MatrixCheckboxRow
            label="Edit Formula"
            checked={permissions.edit_formulae}
            onToggle={() => toggle('edit_formulae')}
            showDivider={false}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContinue}
          disabled={saving}
          style={[styles.continueBtn, saving && styles.continueBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
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
  permissionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 12,
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
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 12,
    textAlign: 'center',
  },
});
