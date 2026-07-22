import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';

interface CapturePreviewOverlayProps {
  visible: boolean;
  loading?: boolean;
  uri?: string | null;
  title?: string;
  showAddMore?: boolean;
  onDelete: () => void;
  onCalculate: () => void;
  onAddMore?: () => void;
}

export function CapturePreviewOverlay({
  visible,
  loading = false,
  uri,
  title = 'Captured Image',
  showAddMore = false,
  onDelete,
  onCalculate,
  onAddMore,
}: CapturePreviewOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 bg-black/85 px-5 pt-6">
      <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
        <Text className="mb-4 text-base font-bold text-text-primary">{title}</Text>

        {loading ? (
          <View className="mb-5 h-56 items-center justify-center rounded-xl bg-black/5">
            <ActivityIndicator size="large" color="#1E2F28" />
          </View>
        ) : uri ? (
          <Image source={{ uri }} className="mb-5 h-56 w-full rounded-xl" resizeMode="contain" />
        ) : null}

        <View className="flex-row gap-3">
          <OutlineButton title={loading ? 'Cancel' : 'Delete'} onPress={onDelete} />
          {!loading && uri ? <PrimaryGreenButton title="Calculate" onPress={onCalculate} /> : null}
        </View>

        {showAddMore && !loading && uri ? (
          <Pressable
            onPress={onAddMore}
            className="mt-3 items-center rounded-button border border-border bg-white py-3"
          >
            <Text className="text-sm font-semibold text-text-secondary">Add More Image</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
