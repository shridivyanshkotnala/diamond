import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Crown, CreditCard, FileText, Shield, Layers3, BadgeCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { Colors, Radius, Spacing } from '@/constants/theme';

const TRIAL_GREEN = '#163B34';
const TRIAL_GREEN_LIGHT = '#2F5A50';
const ACCENT_GOLD = '#C5A059';
const BUTTON_GOLD = '#C8A96E';

interface InfoRow {
  id: string;
  title: string;
  subtitle: string;
  icon: 'formula' | 'inventory' | 'role' | 'payment' | 'billing';
}

const SUBSCRIPTION_ROWS: InfoRow[] = [
  {
    id: 'formula',
    title: 'Formulae Manager Access',
    subtitle: 'Fully customize Formulae Creation',
    icon: 'formula',
  },
  {
    id: 'inventory',
    title: 'Unlimited Inventory',
    subtitle: 'Bulk upload and manage large stock sheets',
    icon: 'inventory',
  },
  {
    id: 'role',
    title: 'Advanced Role Control',
    subtitle: 'Granular permissions for senior and junior salesmen',
    icon: 'role',
  },
];

const BILLING_ROWS: InfoRow[] = [
  {
    id: 'payment',
    title: 'Payment Methods',
    subtitle: 'Manage cards & bank accounts',
    icon: 'payment',
  },
  {
    id: 'billing',
    title: 'Billing History',
    subtitle: 'Download past invoices',
    icon: 'billing',
  },
];

function RowIcon({ type }: { type: InfoRow['icon'] }) {
  if (type === 'formula') return <Layers3 size={16} color={ACCENT_GOLD} />;
  if (type === 'inventory') return <CreditCard size={16} color={ACCENT_GOLD} />;
  if (type === 'role') return <Shield size={16} color={ACCENT_GOLD} />;
  if (type === 'payment') return <CreditCard size={16} color={Colors.textSecondary} />;
  return <FileText size={16} color={Colors.textSecondary} />;
}

function DetailCard({ rows }: { rows: InfoRow[] }) {
  return (
    <View style={styles.sectionCard}>
      {rows.map((row, index) => (
        <View key={row.id}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <RowIcon type={row.icon} />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailTitle}>{row.title}</Text>
              <Text style={styles.detailSubtitle}>{row.subtitle}</Text>
            </View>
          </View>
          {index < rows.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function SubscriptionManagerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>
            Subscription{'\n'}Manager
          </Text>
        </View>

        <View style={styles.trialCard}>
          <View style={styles.trialTop}>
            <Crown size={16} color={ACCENT_GOLD} />
            <Text style={styles.trialTitle}>Pratham Pro Trial</Text>
          </View>
          <Text style={styles.trialSubtitle}>30 days remaining in your free trial</Text>

          <View style={styles.trialDivider} />

          <Text style={styles.renewsLabel}>RENEWS ON</Text>
          <View style={styles.trialBottom}>
            <Text style={styles.renewsDate}>June 21, 2026</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SUBSCRIPTION DETAILS</Text>
        <DetailCard rows={SUBSCRIPTION_ROWS} />

        <Text style={[styles.sectionTitle, styles.billingTitle]}>BILLING & INVOICES</Text>
        <DetailCard rows={BILLING_ROWS} />

        <TouchableOpacity activeOpacity={0.9} style={styles.renewBtn}>
          <BadgeCheck size={16} color={Colors.white} />
          <Text style={styles.renewBtnText}>Renew Subscription</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 38,
    color: Colors.textPrimary,
  },
  trialCard: {
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 4,
    borderRadius: 10,
    padding: 14,
    backgroundColor: TRIAL_GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  trialTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trialTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: Colors.white,
  },
  trialSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  trialDivider: {
    height: 1,
    backgroundColor: TRIAL_GREEN_LIGHT,
    marginVertical: 12,
  },
  renewsLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.7)',
  },
  trialBottom: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  renewsDate: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  activeBadge: {
    backgroundColor: BUTTON_GOLD,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#20352F',
    letterSpacing: 0.4,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    marginHorizontal: Spacing.screenHorizontal,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.7,
  },
  billingTitle: {
    marginTop: 12,
  },
  sectionCard: {
    marginHorizontal: Spacing.screenHorizontal,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextWrap: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  detailSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  renewBtn: {
    marginHorizontal: 16,
    marginTop: 14,
    height: 34,
    backgroundColor: BUTTON_GOLD,
    borderRadius: Radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  renewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
