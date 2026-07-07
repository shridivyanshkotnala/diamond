import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Home, ScanLine, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BottomNavRoute } from '@/types/scanner';

const ACCENT_GOLD = '#D4C19C';
const NAV_GREEN = '#1E332E';
const NAV_HEIGHT = 70;
const NAV_OFFSET = 10;
const ICON_SIZE = 26;
const SCAN_ICON_SIZE = 28;
const FAB_SIZE = 60;

interface BottomNavProps {
  activeRoute?: BottomNavRoute;
  scanButtonVariant?: 'gold' | 'green';
}

export function BottomNav({ activeRoute = 'home', scanButtonVariant = 'gold' }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const scanBtnColor =
    activeRoute === 'scanner' && scanButtonVariant === 'gold' ? ACCENT_GOLD : NAV_GREEN;

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + NAV_OFFSET }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Home
            size={ICON_SIZE}
            color={activeRoute === 'home' ? ACCENT_GOLD : NAV_GREEN}
            fill={activeRoute === 'home' ? ACCENT_GOLD : 'transparent'}
          />
          <Text
            style={[
              styles.navLabel,
              activeRoute === 'home' ? styles.navLabelActive : styles.navLabelInactive,
            ]}
          >
            Home
          </Text>
        </Pressable>

        <View style={styles.navItem}>
          <Pressable
            style={[styles.scanButton, { backgroundColor: scanBtnColor }]}
            onPress={() => router.push('/dashboard/scanner' as Href)}
          >
            <ScanLine size={SCAN_ICON_SIZE} color="#FFFFFF" />
          </Pressable>
          <Text
            style={[
              styles.navLabel,
              activeRoute === 'scanner' ? styles.navLabelActive : styles.navLabelInactive,
            ]}
          >
            Scanner
          </Text>
        </View>

        <Pressable style={styles.navItem}>
          <Sparkles size={ICON_SIZE} color={NAV_GREEN} />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>Pratham AI</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  navBar: {
    minHeight: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  scanButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  navLabel: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  navLabelActive: {
    color: ACCENT_GOLD,
  },
  navLabelInactive: {
    color: '#8E8E8E',
  },
});
