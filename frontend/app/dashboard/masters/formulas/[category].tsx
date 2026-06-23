import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import {
  MASTER_CATEGORY_LABELS,
  MASTER_FORMULA_LABELS,
  parseFormulaCategory,
} from '@/constants/settingsMasters';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function MasterFormulaDetailScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const key = parseFormulaCategory(category);
  const title = MASTER_FORMULA_LABELS[key];

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <PageHeader
        title={title}
        subtitle={`Settings → Masters → Formulas → ${MASTER_CATEGORY_LABELS[key]}`}
      />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Formula management</Text>
        <Text style={styles.cardBody}>
          Configure {key} pricing formulas from the scanner formula flow. Dedicated masters
          editor for {key} formulas will be available here.
        </Text>
        <Pressable
          onPress={() => router.push('/dashboard/scanner/formula-management')}
          style={screenStyles.primaryButton}
        >
          <Text style={screenStyles.primaryButtonText}>Open Formula Manager</Text>
        </Pressable>
      </View>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screenHorizontal,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
