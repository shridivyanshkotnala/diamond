import { Text, View } from 'react-native';

import { useScannerStore } from '@/store/scannerStore';

export function ItemSelectedBadge() {
  const selectedType = useScannerStore((s) => s.selectedType);

  return (
    <View className="self-center rounded-xl bg-black/50 px-4 py-2">
      <Text className="text-sm text-white">
        Item Selected : <Text className="font-semibold text-accent-gold">{selectedType}</Text>
      </Text>
    </View>
  );
}
