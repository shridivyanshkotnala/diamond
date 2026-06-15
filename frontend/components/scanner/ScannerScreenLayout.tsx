import { Dimensions, ImageBackground, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemSelectedBadge } from './ItemSelectedBadge';
import { ScannerBottomSheet } from './ScannerBottomSheet';
import { ScreenBackHeader } from './ScreenBackHeader';

const { width, height } = Dimensions.get('window');

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

interface ScannerScreenLayoutProps {
  children: React.ReactNode;
  instruction: string;
  onShutterPress: () => void;
  onScanAreaPress?: () => void;
}

export function ScannerScreenLayout({
  children,
  instruction,
  onShutterPress,
  onScanAreaPress,
}: ScannerScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader />
      </SafeAreaView>

      <View className="flex-1">
        <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
          <View className="absolute inset-0 bg-black/45" />
          <View className="mt-4">
            <ItemSelectedBadge />
          </View>

          <Pressable
            className="flex-1 items-center justify-center"
            onPress={onScanAreaPress ?? onShutterPress}
          >
            {children}
          </Pressable>
        </ImageBackground>
      </View>

      <ScannerBottomSheet instruction={instruction} onShutterPress={onShutterPress} />
    </View>
  );
}

export const SCANNER_FRAME_WIDTH = width * 0.82;
export const SCANNER_FRAME_HEIGHT = height * 0.28;
