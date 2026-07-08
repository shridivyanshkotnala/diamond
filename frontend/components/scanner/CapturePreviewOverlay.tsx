import { ActivityIndicator, Image, Text, View } from 'react-native';

import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import type { ScanSide } from '@/types/scanner';

interface CapturePreviewOverlayProps {
  visible: boolean;
  loading?: boolean;
  uri?: string | null;
  side: ScanSide;
  onRetake: () => void;
  onConfirm: () => void;
}

function sideLabel(side: ScanSide): string {
  return side === 'front' ? 'Front Side' : 'Back Side';
}

export function CapturePreviewOverlay({
  visible,
  loading = false,
  uri,
  side,
  onRetake,
  onConfirm,
}: CapturePreviewOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 bg-black/85 px-5 pt-6">
      <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
        <Text className="mb-4 text-base font-bold text-text-primary">{sideLabel(side)}</Text>

        {loading ? (
          <View className="mb-5 h-56 items-center justify-center rounded-xl bg-black/5">
            <ActivityIndicator size="large" color="#1E2F28" />
          </View>
        ) : uri ? (
          <Image source={{ uri }} className="mb-5 h-56 w-full rounded-xl" resizeMode="contain" />
        ) : null}

        <View className="flex-row gap-3">
          <OutlineButton title={loading ? 'Cancel' : 'Retake'} onPress={onRetake} />
          {!loading && uri ? <PrimaryGreenButton title="OK" onPress={onConfirm} /> : null}
        </View>
      </View>
    </View>
  );
}
