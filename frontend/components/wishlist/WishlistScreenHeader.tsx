import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MoreVertical, SlidersHorizontal, X } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';

interface WishlistScreenHeaderProps {
  onClearWishlist: () => void;
}

export function WishlistScreenHeader({ onClearWishlist }: WishlistScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <X size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.brand} numberOfLines={1}>
          Pratham International...
        </Text>
        <View style={styles.topActions}>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <SlidersHorizontal size={18} color={Colors.textPrimary} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <MoreVertical size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Wishlist</Text>
        <Pressable onPress={onClearWishlist} hitSlop={8}>
          <Text style={styles.clearLink}>Clear Wishlist</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
