import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { WishlistItem } from '@/types/wishlist';
import { formatWishlistTimestamp } from '@/utils/wishlistUtils';

function formatWishlistAmount(amount: number) {
  return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatRateLabel(rate?: 'rtgs' | 'cash') {
  if (rate === 'rtgs') return 'RTGS Rate';
  if (rate === 'cash') return 'Cash Rate';
  return '';
}

interface WishlistCardProps {
  item: WishlistItem;
  onPress: () => void;
  onDelete: () => void;
}

export function WishlistCard({ item, onPress, onDelete }: WishlistCardProps) {
  const rateSource = item.calculationRate ?? item.snapshot?.scanData?.calculationRate;
  const rateLabel = formatRateLabel(rateSource);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.cardPressed]}>
      <View style={styles.card}>
        {/* ─── Header: Title & Timestamp ─── */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.timestamp}>
            {formatWishlistTimestamp(item.scanTimestamp || item.addedAt)}
          </Text>
        </View>

        {/* ─── Divider ─── */}
        <View style={styles.divider} />

        {/* ─── Footer: Price & Actions ─── */}
        <View style={styles.bottomRow}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{formatWishlistAmount(item.totalMrp)}</Text>
            {rateLabel ? <Text style={styles.rateText}>{rateLabel}</Text> : null}
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={12}
            style={styles.deleteBtn}
          >
            <Trash2 size={18} color="#E53935" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  rateText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: Colors.dangerBg,
    borderRadius: 10,
  },
});

