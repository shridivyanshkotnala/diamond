import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PriceCard } from '@/components/scanner/PriceCard';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';

const BREAKDOWN = [
  { label: 'Gold Base Value', value: '₹1,45,230' },
  { label: 'Making Charges', value: '₹17,428' },
  { label: 'Diamond Value', value: '₹11,400' },
  { label: 'GST (3%)', value: '₹10,442' },
];

export default function InitialPriceCalculationScreen() {
  const router = useRouter();

  return (
    <ScanScreenWrapper
      title="Initial Price Calculation"
      scanButtonVariant="green"
      footer={
        <PrimaryGreenButton
          title="View Scan Results"
          onPress={() => router.push('/dashboard/scanner/scan-results')}
        />
      }
    >
      <PriceCard
        label="Net Calculated Price"
        amount="₹1,84,500"
        subtitle="Inclusive of 3% GST"
      />

      <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
        Price Breakdown
      </Text>

      {BREAKDOWN.map((item) => (
        <View
          key={item.label}
          className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
        >
          <Text className="text-sm text-text-secondary">{item.label}</Text>
          <Text className="text-sm font-semibold text-text-primary">{item.value}</Text>
        </View>
      ))}

      <View className="mt-4 rounded-2xl bg-success-bg p-4">
        <Text className="text-xs font-semibold text-success-text">
          All formula rules executed successfully
        </Text>
      </View>
    </ScanScreenWrapper>
  );
}
