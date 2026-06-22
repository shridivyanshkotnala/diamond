import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { JewelleryTypeSelector } from '@/components/scanner/JewelleryTypeSelector';
import { useScannerStore } from '@/store/scannerStore';
import type { JewelleryType } from '@/types/scanner';

interface JewelleryTypeModalProps {
  onStartScan: (type: JewelleryType) => void;
  loading?: boolean;
}

export function JewelleryTypeModal({ onStartScan, loading = false }: JewelleryTypeModalProps) {
  const selectedType = useScannerStore((s) => s.selectedType);

  return (
    <View className="rounded-[20px] bg-white px-6 py-7 shadow-lg">
      <JewelleryTypeSelector variant="modal" disabled={loading} />

      <Pressable
        onPress={() => onStartScan(selectedType)}
        disabled={loading}
        className="mt-6 items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-sm font-semibold text-white">Start Scan</Text>
        )}
      </Pressable>
    </View>
  );
}
