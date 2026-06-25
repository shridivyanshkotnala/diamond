import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import { WishlistScreenHeader } from '@/components/wishlist/WishlistScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistScreen() {
  const router = useRouter();
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearAll = useWishlistStore((s) => s.clearAll);

  const handleDeleteItem = (id: string) => {
    Alert.alert('Delete item', 'Do you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeItem(id),
      },
    ]);
  };

  const handleClearWishlist = () => {
    if (items.length === 0) return;

    Alert.alert('Clear wishlist', 'Do you want to clear all the wishlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => clearAll(),
      },
    ]);
  };

  const handleOpenItem = (id: string) => {
    router.push({
      pathname: '/dashboard/scanner/scan-results',
      params: { fromWishlist: '1', wishlistId: id },
    } as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WishlistScreenHeader onClearWishlist={handleClearWishlist} />

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyHint}>
            Scan jewellery and tap Add to Wishlist on the results screen.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onPress={() => handleOpenItem(item.id)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </ScrollView>
      )}

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
