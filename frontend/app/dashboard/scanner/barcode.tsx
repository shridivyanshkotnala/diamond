import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { BarcodeOverlay } from '@/components/scanner/BarcodeOverlay';
import { ScannerScreenLayout } from '@/components/scanner/ScannerScreenLayout';
import { isDemoScanMode } from '@/constants/scanMode';
import { useScannerStore } from '@/store/scannerStore';
import { ApiError } from '@/utils/apiClient';
import { captureScanImage, MOCK_SCAN_IMAGE_URI } from '@/utils/imagePicker';
import { completeDemoCapture, uploadBackImage, uploadFrontImage } from '@/utils/scanApi';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const scanId = useScannerStore((s) => s.scanId);
  const scanMode = useScannerStore((s) => s.scanMode);
  const scanSide = useScannerStore((s) => s.scanSide);
  const frontImageUri = useScannerStore((s) => s.frontImageUri);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const setFrontImageUri = useScannerStore((s) => s.setFrontImageUri);
  const setBackImageUri = useScannerStore((s) => s.setBackImageUri);
  const [uploading, setUploading] = useState(false);

  const isDemo = isDemoScanMode();

  const instruction = isDemo
    ? scanSide === 'front'
      ? 'Tap to Simulate Front Scan'
      : 'Tap to Simulate Back Scan'
    : scanSide === 'front'
      ? 'Click to Scan Front Side'
      : 'Click to Scan Back Side';

  const goToProcessing = () => {
    router.push('/dashboard/scanner/processing' as Href);
  };

  const runDemoCapture = async (hasBackImage: boolean) => {
    if (!scanId) return;

    setUploading(true);
    try {
      await completeDemoCapture(scanId, hasBackImage);
      goToProcessing();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Demo scan failed. Please try again.';
      Alert.alert('Scan Error', message);
    } finally {
      setUploading(false);
    }
  };

  const uploadRealImages = async (frontUri: string, backUri: string | null) => {
    if (!scanId) {
      Alert.alert('Scan Error', 'No active scan session. Please start a new scan.');
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    setUploading(true);
    try {
      await uploadFrontImage(scanId, frontUri);
      if (backUri) {
        await uploadBackImage(scanId, backUri);
      }
      goToProcessing();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to upload images. Please try again.';
      Alert.alert('Upload Error', message);
    } finally {
      setUploading(false);
    }
  };

  const handleShutter = async () => {
    if (uploading) return;

    if (isDemo) {
      if (scanSide === 'front') {
        setFrontImageUri(MOCK_SCAN_IMAGE_URI);
        if (scanMode === 'both') {
          setScanSide('back');
          return;
        }
        await runDemoCapture(false);
        return;
      }

      setBackImageUri(MOCK_SCAN_IMAGE_URI);
      await runDemoCapture(true);
      return;
    }

    const uri = await captureScanImage();
    if (!uri) {
      Alert.alert('Image Required', 'Please capture or select a tag photo to continue.');
      return;
    }

    if (scanSide === 'front') {
      setFrontImageUri(uri);
      if (scanMode === 'both') {
        setScanSide('back');
        return;
      }
      await uploadRealImages(uri, null);
      return;
    }

    setBackImageUri(uri);
    await uploadRealImages(frontImageUri ?? uri, uri);
  };

  if (!scanId) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#D4C19C" />
      </View>
    );
  }

  return (
    <ScannerScreenLayout instruction={instruction} onShutterPress={handleShutter}>
      <BarcodeOverlay />
      {uploading ? (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <ActivityIndicator size="large" color="#D4C19C" />
        </View>
      ) : null}
    </ScannerScreenLayout>
  );
}
