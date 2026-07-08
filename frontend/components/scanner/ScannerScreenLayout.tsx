import { type RefObject } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { ImageUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemSelectedBadge } from './ItemSelectedBadge';
import { ScannerBottomSheet } from './ScannerBottomSheet';
import { ScreenBackHeader } from './ScreenBackHeader';
import { TagCameraPreview, type TagCameraPreviewRef } from './TagCameraPreview';

const { width, height } = Dimensions.get('window');

interface ScannerScreenLayoutProps {
  children: React.ReactNode;
  instruction: string;
  onShutterPress: () => void;
  onUploadPress?: () => void;
  cameraRef?: RefObject<TagCameraPreviewRef | null>;
  headerContent?: React.ReactNode;
  controlsHidden?: boolean;
}

function UploadAction({
  onPress,
  hidden,
}: {
  onPress?: () => void;
  hidden?: boolean;
}) {
  if (!onPress || hidden) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      className="mt-4 h-[46px] self-center flex-row items-center gap-2 rounded-[24px] bg-white px-5 shadow-md active:opacity-90"
      style={{ elevation: 3 }}
    >
      <ImageUp size={18} color="#1E332E" />
      <Text className="text-sm font-semibold text-text-primary">Upload Image</Text>
    </Pressable>
  );
}

export function ScannerScreenLayout({
  children,
  instruction,
  onShutterPress,
  onUploadPress,
  cameraRef,
  headerContent,
  controlsHidden = false,
}: ScannerScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader />
      </SafeAreaView>

      <View className="flex-1 overflow-hidden bg-black">
        <TagCameraPreview ref={cameraRef} />
        <View className="absolute inset-0 bg-black/20" />
        <View className="mt-4">
          <ItemSelectedBadge />
          {headerContent}
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <Pressable onPress={onShutterPress}>{children}</Pressable>
            <UploadAction onPress={onUploadPress} hidden={controlsHidden} />
          </View>
        </View>
      </View>

      <ScannerBottomSheet
        instruction={instruction}
        onShutterPress={onShutterPress}
        hidden={controlsHidden}
      />
    </View>
  );
}

export const SCANNER_FRAME_WIDTH = width * 0.82;
export const SCANNER_FRAME_HEIGHT = height * 0.28;
