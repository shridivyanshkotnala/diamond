import { Text, View } from 'react-native';

import { DataGridSection } from '@/components/scanner/DataGridSection';
import { SearchableSelectDropdown } from '@/components/scanner/SearchableSelectDropdown';
import {
  KARAT_DROPDOWN_OPTIONS,
  type FinalTabPricingResult,
} from '@/utils/scanPriceCalculation';

interface RawMaterialGoldSectionProps {
  badge: string;
  pricing: FinalTabPricingResult;
  onKaratChange?: (karat: string) => void;
}

export function RawMaterialGoldSection({
  badge,
  pricing,
  onKaratChange,
}: RawMaterialGoldSectionProps) {
  const purityNote =
    pricing.puritySource === 'labourOverride'
      ? `${pricing.effectivePurityPercent} (custom purity)`
      : pricing.puritySource === 'tunchOverride'
        ? `${pricing.effectivePurityPercent} (admin override)`
        : `${pricing.effectivePurityPercent}`;

  return (
    <DataGridSection
      title="Raw Material"
      badge={badge}
      items={[
        { label: 'Gross Wt.', value: pricing.grossWtDisplay },
        { label: 'Net Wt.', value: pricing.netWtDisplay },
        {
          label: 'Tunch Purity',
          value: pricing.selectedKarat,
          showDropdown: true,
        },
        {
          label: 'Pure Wt.',
          value: `${pricing.pureWtDisplay} (${purityNote})`,
        },
      ]}
    />
  );
}

export function RawMaterialGoldSectionInteractive({
  badge,
  pricing,
  onKaratChange,
}: RawMaterialGoldSectionProps) {
  const purityNote =
    pricing.puritySource === 'labourOverride'
      ? `${pricing.effectivePurityPercent} (custom purity)`
      : pricing.puritySource === 'tunchOverride'
        ? `${pricing.effectivePurityPercent} (admin override)`
        : `${pricing.effectivePurityPercent} from backend`;

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-sm font-bold uppercase text-text-primary">Raw Material</Text>
        <View className="rounded-full bg-primary px-3 py-1">
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      </View>

      <View className="flex-row border-b border-border">
        <View className="flex-1 border-r border-border p-4">
          <Text className="text-xs text-text-muted">Gross Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.grossWtDisplay}</Text>
        </View>
        <View className="flex-1 p-4">
          <Text className="text-xs text-text-muted">Net Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.netWtDisplay}</Text>
        </View>
      </View>

      <View className="flex-row">
        <View className="flex-1 border-r border-border p-4">
          <Text className="text-xs text-text-muted">Tunch Purity</Text>
          {onKaratChange ? (
            <SearchableSelectDropdown
              value={pricing.selectedKarat}
              options={KARAT_DROPDOWN_OPTIONS.map((option) => ({ value: option, label: option }))}
              onChange={onKaratChange}
              placeholder="Select karat"
              containerClassName="mt-1.5 flex-1"
            />
          ) : (
            <Text className="mt-1.5 text-sm text-text-secondary">{pricing.selectedKarat}</Text>
          )}
          <Text className="mt-1 text-[10px] text-text-muted">{purityNote}</Text>
        </View>
        <View className="flex-1 p-4">
          <Text className="text-xs text-text-muted">Pure Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.pureWtDisplay}</Text>
        </View>
      </View>
    </View>
  );
}
