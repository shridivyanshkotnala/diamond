import { Pressable, Text, View } from 'react-native';

interface ScannerTypeModalProps {
  onSingleSide: () => void;
  onBothSide: () => void;
}

export function ScannerTypeModal({ onSingleSide, onBothSide }: ScannerTypeModalProps) {
  return (
    <View className="rounded-[20px] bg-white px-6 py-7 shadow-lg">
      <Text className="text-center text-lg font-bold text-text-primary">Select Scanner Type</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
        Please select tag type by which information have to select.
      </Text>

      <View className="mt-6 gap-3">
        <Pressable
          onPress={onSingleSide}
          className="items-center rounded-button border border-border py-3.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-text-primary">Single Side Scan</Text>
        </Pressable>

        <Pressable
          onPress={onBothSide}
          className="items-center rounded-button bg-primary py-3.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-white">Both Side Scan</Text>
        </Pressable>
      </View>
    </View>
  );
}
