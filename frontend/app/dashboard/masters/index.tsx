import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import {
  MASTER_FORMULA_ITEMS,
  MASTER_RATES_ITEMS,
} from '@/constants/settingsMasters';
import { Colors, Radius, Spacing } from '@/constants/theme';

function MasterGroup({
  title,
  items,
}: {
  title: string;
  items: typeof MASTER_RATES_ITEMS;
}) {
  const router = useRouter();

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(item.route as Href)}
          style={styles.row}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

export default function MastersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Masters</Text>
        <Text style={styles.subtitle}>Rates and formulas configuration</Text>
      </View>

      <MasterGroup title="Rates" items={MASTER_RATES_ITEMS} />
      <MasterGroup title="Formulas" items={MASTER_FORMULA_ITEMS} />

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  group: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  rowSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
