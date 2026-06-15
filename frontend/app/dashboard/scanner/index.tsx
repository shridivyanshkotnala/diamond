import { ImageBackground, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ScannerTypeModal } from '@/components/scanner/ScannerTypeModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { useScannerStore } from '@/store/scannerStore';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

export default function ScannerTypeScreen() {
  const router = useRouter();
  const setScanMode = useScannerStore((s) => s.setScanMode);
  const setScanSide = useScannerStore((s) => s.setScanSide);

  const handleSelect = (mode: 'single' | 'both') => {
    setScanMode(mode);
    setScanSide('front');
    router.push('/dashboard/scanner/jewellery-type' as Href);
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader onBack={() => router.back()} />
      </SafeAreaView>

      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/50" />
        <View className="flex-1 items-center justify-center px-6 pb-28">
          <View className="w-full">
            <ScannerTypeModal
              onSingleSide={() => handleSelect('single')}
              onBothSide={() => handleSelect('both')}
            />
          </View>
        </View>
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
