import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { isDemoScanMode } from '@/constants/scanMode';

export const MOCK_SCAN_IMAGE_URI = 'mock://local-scan-image';

export async function prepareImageForUpload(uri: string): Promise<string> {
  if (uri.startsWith('mock://') || uri.startsWith('file://')) {
    return uri;
  }

  const extension = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const destination = `${FileSystem.cacheDirectory}scan-${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

async function pickFromGallery(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return pickFromGallery();
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/** Real API mode only — demo mode must not call this. */
export async function captureScanImage(): Promise<string | null> {
  try {
    return await pickFromCamera();
  } catch {
    return pickFromGallery();
  }
}

export function shouldUseDemoCapture(): boolean {
  return isDemoScanMode();
}
