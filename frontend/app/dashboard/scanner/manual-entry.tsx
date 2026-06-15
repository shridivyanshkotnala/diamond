import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';

import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { JewelleryTypeChips } from '@/components/scanner/JewelleryTypeChips';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { useScannerStore } from '@/store/scannerStore';

export default function ManualEntryScreen() {
  const router = useRouter();
  const scanData = useScannerStore((s) => s.scanData);
  const updateScanData = useScannerStore((s) => s.updateScanData);

  return (
    <ScanScreenWrapper
      title="Manual Entry"
      footer={
        <PrimaryGreenButton
          title="Continue to Formula"
          onPress={() => router.push('/dashboard/scanner/formula-flow')}
        />
      }
    >
      <View className="mb-6">
        <JewelleryTypeChips variant="form" />
      </View>

      <FormSection title="Item Identity">
        <FormInput
          label="SKU / Tracking Code"
          value={scanData.sku}
          placeholder="e.g. G-1002"
          onChangeText={(sku) => updateScanData({ sku })}
        />
        <View className="mb-4">
          <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-label">
            Item Category
          </Text>
          <View className="flex-row items-center justify-between rounded-input border border-border bg-[#F4F5F7] px-4 py-3.5">
            <Text className="text-base text-text-primary">{scanData.category}</Text>
            <ChevronDown size={20} color="#757575" />
          </View>
        </View>
      </FormSection>

      <FormSection title="Item Classification">
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <FormInput
              label="Gross Wt (g)"
              value={scanData.grossWt}
              onChangeText={(grossWt) => updateScanData({ grossWt })}
            />
          </View>
          <View className="w-[48%]">
            <FormInput
              label="Net Wt (g)"
              value={scanData.netWt}
              onChangeText={(netWt) => updateScanData({ netWt })}
            />
          </View>
          <View className="w-[48%]">
            <FormInput
              label="Pure Wt"
              value={scanData.pureWt}
              onChangeText={(pureWt) => updateScanData({ pureWt })}
            />
          </View>
          <View className="w-[48%]">
            <FormInput
              label="Tunch (%)"
              value={scanData.tunch}
              onChangeText={(tunch) => updateScanData({ tunch })}
            />
          </View>
        </View>
      </FormSection>

      <FormSection title="Diamond Details">
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <FormInput
              label="Diamond Rate (₹/ct)"
              value={scanData.diamondRate}
              onChangeText={(diamondRate) => updateScanData({ diamondRate })}
            />
          </View>
          <View className="w-[48%]">
            <FormInput
              label="Diamond Quality"
              value={scanData.diamondQuality}
              onChangeText={(diamondQuality) => updateScanData({ diamondQuality })}
            />
          </View>
        </View>
      </FormSection>
    </ScanScreenWrapper>
  );
}
