import { useState } from 'react';
import { Alert, ImageBackground, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { JewelleryTypeModal } from '@/components/scanner/JewelleryTypeModal';
import { ScannerTypeModal } from '@/components/scanner/ScannerTypeModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { useScannerStore } from '@/store/scannerStore';
import type { JewelleryType } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { createScan } from '@/utils/scanApi';
import { structuredDataToScanItem } from '@/utils/scanMappers';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

export default function ScannerScreen() {
  const router = useRouter();
  const [showScannerType, setShowScannerType] = useState(false);
  const [loading, setLoading] = useState(false);
  const setSelectedType = useScannerStore((s) => s.setSelectedType);
  const setScanMode = useScannerStore((s) => s.setScanMode);
  const setScanId = useScannerStore((s) => s.setScanId);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const setFrontImageUri = useScannerStore((s) => s.setFrontImageUri);
  const setBackImageUri = useScannerStore((s) => s.setBackImageUri);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);

  const handleTypeSelected = (type: JewelleryType) => {
    setSelectedType(type);
    // Show scanner type modal after jewellery type is selected
    setShowScannerType(true);
  };

  const handleScannerTypeSelected = async (mode: 'single' | 'both', type: JewelleryType) => {
    setScanMode(mode);
    setScanSide('front');
    setFrontImageUri(null);
    setBackImageUri(null);
    setStructuredData({});
    updateScanData(structuredDataToScanItem({}));
    setLoading(true);

    try {
      const session = await createScan(type, mode);
      setScanId(session.scanId);
      // Auto-proceed to camera scanner
      router.push('/dashboard/scanner/barcode' as Href);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to start scan. Please try again.';
      Alert.alert('Scan Error', message);
      setLoading(false);
      setShowScannerType(false);
    }
  };

  const selectedType = useScannerStore((s) => s.selectedType);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader onBack={() => router.back()} />
      </SafeAreaView>

      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/50" />
        <View className="flex-1 items-center justify-center px-6 pb-28">
          <View className="w-full">
            {!showScannerType ? (
              <JewelleryTypeModal onTypeSelected={handleTypeSelected} />
            ) : (
              <ScannerTypeModal
                onSingleSide={() => handleScannerTypeSelected('single', selectedType)}
                onBothSide={() => handleScannerTypeSelected('both', selectedType)}
              />
            )}
          </View>
        </View>
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
