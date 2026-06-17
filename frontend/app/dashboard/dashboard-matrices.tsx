import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { MatrixCheckboxRow } from '@/components/settings/MatrixCheckboxRow';
import {
  GOLD_MATRIX_SECTIONS,
  SILVER_MATRIX_SECTION,
  WEIGHT_ACCESS_ROWS,
  type MatrixKey,
} from '@/constants/dashboardMatrices';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMatricesStore } from '@/store/matricesStore';
import { useRequireSettingsAccess } from '@/hooks/useSettingsAccess';

const ACCENT_GOLD = '#C5A059';
const BUTTON_GREEN = '#1B2E26';

export default function DashboardMatricesScreen() {
  const allowed = useRequireSettingsAccess('matrices');
  const router = useRouter();
  const storedValues = useMatricesStore((s) => s.values);
  const applyValues = useMatricesStore((s) => s.applyValues);

  const [draft, setDraft] = useState(storedValues);
  const [saving, setSaving] = useState(false);

  if (!allowed) return null;

  const toggle = (key: MatrixKey) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      applyValues(draft);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <View style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>
            Home Dashboard{'\n'}Matrices Control
          </Text>
        </View>

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScroll}
            keyboardShouldPersistTaps="handled"
          >
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
                    checked={draft[row.key]}
                    onToggle={() => toggle(row.key)}
                    showDivider={index < section.rows.length - 1}
                  />
                ))}
              </View>
            ))}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{SILVER_MATRIX_SECTION.sectionLabel}</Text>
              </View>
              {SILVER_MATRIX_SECTION.rows.map((row, index) => (
                <MatrixCheckboxRow
                  key={row.key}
                  label={row.label}
                  checked={draft[row.key]}
                  onToggle={() => toggle(row.key)}
                  showDivider={index < SILVER_MATRIX_SECTION.rows.length - 1}
                />
              ))}
            </View>

            <View style={styles.permissionSection}>
              <MatrixCheckboxRow
                label="Permission to Edit Market Prices"
                checked={draft.edit_market_prices}
                onToggle={() => toggle('edit_market_prices')}
                showDivider={false}
              />
            </View>

            <View style={styles.accessBox}>
              {WEIGHT_ACCESS_ROWS.map((row, index) => (
                <MatrixCheckboxRow
                  key={row.key}
                  label={row.label}
                  checked={draft[row.key]}
                  onToggle={() => toggle(row.key)}
                  variant="dark"
                  showDivider={index < WEIGHT_ACCESS_ROWS.length - 1}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              activeOpacity={0.9}
              style={[styles.updateBtn, saving && styles.updateBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.updateBtnText}>Update</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardScroll: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: 28,
    paddingBottom: 120,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  goldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
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
  permissionSection: {
    marginTop: 16,
  },
  accessBox: {
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.input,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 16,
  },
  updateBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  updateBtnDisabled: {
    opacity: 0.7,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
