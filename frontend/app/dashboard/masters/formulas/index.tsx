import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MasterNavList } from '@/components/dashboard/masters/MasterNavList';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MASTER_FORMULA_ITEMS } from '@/constants/settingsMasters';
import { Colors, Spacing } from '@/constants/theme';

export default function MasterFormulasScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Formulas</Text>
        <Text style={styles.subtitle}>Settings → Masters → Formulas</Text>
      </View>

      <View style={styles.content}>
        <MasterNavList items={MASTER_FORMULA_ITEMS} />
      </View>

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
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  content: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 20,
  },
});
