import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Menu } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';

const ACCENT_GOLD = '#D4C19C';

export function DashboardHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.menuBtn}
        hitSlop={8}
        onPress={() => router.push('/dashboard/settings')}
      >
        <Menu size={20} color={Colors.textPrimary} />
      </Pressable>

      <Text style={styles.brandTitle}>Pratham International</Text>

      <Pressable style={styles.wishlistBtn}>
        <Heart size={14} color={ACCENT_GOLD} fill={ACCENT_GOLD} />
        <Text style={styles.wishlistText}>Wishlist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  wishlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  wishlistText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
