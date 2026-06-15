import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Menu } from 'lucide-react-native';

import { Colors } from '@/constants/theme';

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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
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
    marginLeft: 12,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  wishlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wishlistText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
