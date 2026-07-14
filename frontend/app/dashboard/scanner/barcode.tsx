import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { BarcodeOverlay } from '@/components/scanner/BarcodeOverlay';
import { CapturedSidesStrip, type CaptureSource } from '@/components/scanner/CapturedSidesStrip';
import { CapturePreviewOverlay } from '@/components/scanner/CapturePreviewOverlay';
import { ScannerScreenLayout } from '@/components/scanner/ScannerScreenLayout';
import type { TagCameraPreviewRef } from '@/components/scanner/TagCameraPreview';
import { useScannerStore } from '@/store/scannerStore';
import type { ScanSide } from '@/types/scanner';
import {
  captureScanImageFallback,
  pickImageFromGallery,
} from '@/utils/imagePicker';

type PendingPreview = {
  uri: string;
  side: ScanSide;
  source: CaptureSource;
};

type ConfirmedCapture = {
  uri: string;
  source: CaptureSource;
};

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const cameraRef = useRef<TagCameraPreviewRef>(null);
  const scanId = useScannerStore((s) => s.scanId);
  const scanMode = useScannerStore((s) => s.scanMode);
  const scanSide = useScannerStore((s) => s.scanSide);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const setFrontImageUri = useScannerStore((s) => s.setFrontImageUri);
  const setBackImageUri = useScannerStore((s) => s.setBackImageUri);
  const resetScanLoading = useScannerStore((s) => s.resetScanLoading);

  const [isPickingImage, setIsPickingImage] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<PendingPreview | null>(null);
  const [confirmedFront, setConfirmedFront] = useState<ConfirmedCapture | null>(null);
  const [confirmedBack, setConfirmedBack] = useState<ConfirmedCapture | null>(null);

  const isBothSides = scanMode === 'both';
  const overlayVisible = isPickingImage || Boolean(pendingPreview);

  const instruction =
    scanSide === 'front'
      ? isBothSides
        ? 'Align the front of the tag in the frame and tap capture'
        : 'Align the tag in the frame and tap capture'
      : 'Now align the back side of the tag and tap capture';

  const goToProcessing = () => {
    resetScanLoading();
    router.push('/dashboard/scanner/processing' as Href);
  };

  const openPreview = (uri: string, source: CaptureSource) => {
    setPendingPreview({
      uri,
      side: scanSide,
      source,
    });
  };

  const handlePreviewConfirm = () => {
    if (!pendingPreview) return;

    const { uri, side, source } = pendingPreview;
    setPendingPreview(null);

    if (side === 'front') {
      const frontCapture = { uri, source };
      setConfirmedFront(frontCapture);
      setFrontImageUri(uri);

      if (isBothSides) {
        setScanSide('back');
        return;
      }

      goToProcessing();
      return;
    }

    const backCapture = { uri, source };
    setConfirmedBack(backCapture);
    setBackImageUri(uri);
    if (!confirmedFront?.uri) {
      setFrontImageUri(uri);
    }
    goToProcessing();
  };

  const handlePreviewRetake = () => {
    setPendingPreview(null);
    setIsPickingImage(false);
  };

  const resolveCaptureUri = async (): Promise<string | null> => {
    const liveUri = await cameraRef.current?.takePicture();
    if (liveUri) {
      return liveUri;
    }

    return captureScanImageFallback();
  };

  const handleShutter = async () => {
    if (overlayVisible) return;

    const uri = await resolveCaptureUri();
    if (!uri) {
      Alert.alert(
        'Image Required',
        'Please capture a clear photo of the jewellery tag, or upload one from your device.',
      );
      return;
    }

    openPreview(uri, 'camera');
  };

  const handleUpload = async () => {
    if (overlayVisible) return;

    setIsPickingImage(true);
    try {
      const uri = await pickImageFromGallery();
      if (!uri) {
        setIsPickingImage(false);
        return;
      }

      setIsPickingImage(false);
      openPreview(uri, 'gallery');
    } catch {
      setIsPickingImage(false);
      Alert.alert('Upload Error', 'Could not load image from your device. Please try again.');
    }
  };

  if (!scanId) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#D4C19C" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScannerScreenLayout
        instruction={instruction}
        onShutterPress={handleShutter}
        onUploadPress={handleUpload}
        controlsHidden={overlayVisible}
        cameraRef={cameraRef}
        headerContent={
          <CapturedSidesStrip
            scanMode={scanMode}
            scanSide={scanSide}
            front={confirmedFront}
            back={confirmedBack}
          />
        }
      >
        <BarcodeOverlay />
      </ScannerScreenLayout>

      <CapturePreviewOverlay
        visible={overlayVisible}
        loading={isPickingImage}
        uri={pendingPreview?.uri}
        side={pendingPreview?.side ?? scanSide}
        onRetake={handlePreviewRetake}
        onConfirm={handlePreviewConfirm}
      />
    </View>
  );
}
