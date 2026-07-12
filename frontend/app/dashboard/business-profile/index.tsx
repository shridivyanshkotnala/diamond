import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { BusinessProfileBanner } from '@/components/settings/BusinessProfileBanner';
import { PageHeader } from '@/components/ui/PageHeader';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getBusinessProfile, formatProfileValue } from '@/utils/businessProfile';

interface DetailRowProps {
  label: string;
  value: string;
  multiline?: boolean;
}

function DetailRow({ label, value, multiline }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, multiline && styles.detailValueMultiline]}
        numberOfLines={multiline ? undefined : 1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function BusinessProfileScreen() {
  const registration = useAuthStore((s) => s.registration);
  const profile = getBusinessProfile(registration);

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Profile" />

        <BusinessProfileBanner
          businessName={formatProfileValue(profile.businessName, 'Your Business')}
          secondaryText={
            profile.gstNumber
              ? `GSTIN: ${profile.gstNumber}`
              : profile.businessType
                ? profile.businessType
                : registration.businessId
                  ? `Business ID: ${registration.businessId}`
                  : 'Registered Organization'
          }
        />

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>BUISNESS DETAILS</Text>
          </View>

          <View style={styles.detailsBody}>
            <DetailRow label="Name of Buisness" value={formatProfileValue(profile.businessName)} />
            <DetailRow label="GST No." value={formatProfileValue(profile.gstNumber)} />
            <DetailRow
              label="Phone No."
              value={profile.phone ? `+91 ${profile.phone}` : 'Not set'}
            />
            <DetailRow label="Email" value={formatProfileValue(profile.email)} />
            <DetailRow label="Company Type" value={formatProfileValue(profile.businessType)} />
            <DetailRow label="Address" value={formatProfileValue(profile.address)} multiline />
          </View>
        </View>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  detailsCard: {
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  detailsHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  detailsBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 18,
  },
  detailValueMultiline: {
    lineHeight: 20,
  },
});
