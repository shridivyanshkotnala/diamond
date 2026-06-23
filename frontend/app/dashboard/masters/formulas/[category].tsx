import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import {
  MASTER_CATEGORY_LABELS,
  MASTER_FORMULA_LABELS,
  parseFormulaCategory,
} from '@/constants/settingsMasters';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function MasterFormulaDetailScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const key = parseFormulaCategory(category);
  const title = MASTER_FORMULA_LABELS[key];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Settings → Masters → Formulas → {MASTER_CATEGORY_LABELS[key]}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Formula management</Text>
        <Text style={styles.cardBody}>
          Configure {key} pricing formulas from the scanner formula flow. Dedicated masters
          editor for {key} formulas will be available here.
        </Text>
        <Pressable
          onPress={() => router.push('/dashboard/scanner/formula-management')}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Open Formula Manager</Text>
        </Pressable>
      </View>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.screenHorizontal, paddingTop: 8, paddingBottom: 16 },
  backBtn: { width: 32, height: 32, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  card: {
    marginHorizontal: Spacing.screenHorizontal,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: 16,
    backgroundColor: Colors.white,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  cardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  btn: {
    backgroundColor: '#1B3022',
    borderRadius: Radius.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});
