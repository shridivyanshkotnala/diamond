import { Text, View } from 'react-native';

import type { FinalTabPricingResult } from '@/utils/scanPriceCalculation';

interface LabourChargeResultSectionProps {
  pricing: FinalTabPricingResult;
}

export function LabourChargeResultSection({ pricing }: LabourChargeResultSectionProps) {
  const modeLabel = pricing.useFixedAmountMode ? 'Rate Based' : 'Not configured';
  const modeHint = pricing.useFixedAmountMode
    ? 'Labour calculated using the configured rate.'
    : 'Enter a labour rate during review.';

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <View className="border-b border-border px-4 py-3">
        <Text className="text-sm font-bold uppercase text-text-primary">Labour Charge</Text>
        <Text className="mt-0.5 text-[10px] text-text-muted">{modeLabel}</Text>
      </View>

      <View className="flex-row border-b border-border">
        <View className="flex-1 border-r border-border p-4">
          <Text className="text-xs text-text-muted">Mode</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{modeLabel}</Text>
        </View>
        <View className="flex-1 p-4">
          <Text className="text-xs text-text-muted">Labour Amount</Text>
          <Text className="mt-1.5 text-sm font-semibold text-text-primary">
            {pricing.labourDisplay}
          </Text>
        </View>
      </View>

      <View className="px-4 py-3">
        <Text className="text-xs leading-5 text-text-muted">{modeHint}</Text>
      </View>
    </View>
  );
}
