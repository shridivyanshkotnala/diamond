import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { useScannerStore } from '@/store/scannerStore';
import { ApiError } from '@/utils/apiClient';
import { createScan } from '@/utils/scanApi';
import { structuredDataToScanItem } from '@/utils/scanMappers';

export default function ScannerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const setScanId = useScannerStore((s) => s.setScanId);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const setFrontImageUri = useScannerStore((s) => s.setFrontImageUri);
  const setBackImageUri = useScannerStore((s) => s.setBackImageUri);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);

  const selectedType = useScannerStore((s) => s.selectedType);

  useEffect(() => {
    let active = true;

    const startScan = async () => {
      setScanSide('front');
      setFrontImageUri(null);
      setBackImageUri(null);
      setStructuredData({});
      updateScanData(structuredDataToScanItem({}));
      setLoading(true);

      try {
        const session = await createScan(selectedType, 'both');
        if (!active) return;
        setScanId(session.scanId);
        router.replace('/dashboard/scanner/barcode' as Href);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to start scan. Please try again.';
        Alert.alert('Scan Error', message);
        setLoading(false);
      }
    };

    void startScan();

    return () => {
      active = false;
    };
  }, [
    router,
    selectedType,
    setBackImageUri,
    setFrontImageUri,
    setScanId,
    setScanSide,
    setStructuredData,
    updateScanData,
  ]);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader onBack={() => router.back()} />
      </SafeAreaView>

      <View className="flex-1 items-center justify-center bg-white">
        {loading ? <ActivityIndicator size="large" color="#1E2F28" /> : null}
      </View>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
