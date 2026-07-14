import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ImageBackground, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UnifiedScanLoader } from '@/components/scanner/UnifiedScanLoader';
import { isDemoScanMode } from '@/constants/scanMode';
import { useFormulaStore } from '@/store/formulaStore';
import { useScannerStore } from '@/store/scannerStore';
import { ScanStage, type ScanItemData } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { syncFormulaStoreFromApi } from '@/utils/formulaSettingsApi';
import {
  applyFormula2KaratConstraint,
  resolveScannedKarat,
} from '@/utils/formulaUtils';
import { analyzeScan, completeDemoCapture, uploadBackImage, uploadFrontImage } from '@/utils/scanApi';
import { structuredDataToScanItem } from '@/utils/scanMappers';
import { fetchLabourRate } from '@/utils/ratesApi';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

export default function ProcessingScreen() {
  const router = useRouter();
  const scanId = useScannerStore((s) => s.scanId);
  const frontImageUri = useScannerStore((s) => s.frontImageUri);
  const backImageUri = useScannerStore((s) => s.backImageUri);
  const setUnknownFields = useScannerStore((s) => s.setUnknownFields);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);
  const scanLoading = useScannerStore((s) => s.scanLoading);
  const setScanLoading = useScannerStore((s) => s.setScanLoading);
  const resetScanLoading = useScannerStore((s) => s.resetScanLoading);
  const [targetProgress, setTargetProgress] = useState(0);
  const progressRef = useRef(0);

  const applyClientFormulaRules = useMemo(
    () => (data: ScanItemData): ScanItemData => {
      const { activeFormula, formula2Rules } = useFormulaStore.getState();
      const withKarat = {
        ...data,
        karat: data.karat || resolveScannedKarat(data.karat, data.tunch),
      };

      if (activeFormula !== 'F2') {
        return withKarat;
      }

      const scannedKarat = resolveScannedKarat(withKarat.karat, withKarat.tunch);
      const { karat, requiresDropdown } = applyFormula2KaratConstraint(
        scannedKarat,
        formula2Rules,
      );

      return {
        ...withKarat,
        karat: requiresDropdown ? '' : karat,
      };
    },
    [],
  );

  useEffect(() => {
    progressRef.current = scanLoading.progress;
  }, [scanLoading.progress]);

  useEffect(() => {
    if (scanLoading.progress >= targetProgress) return;

    const timer = setInterval(() => {
      const current = useScannerStore.getState().scanLoading.progress;
      const target = targetProgress;
      if (current >= target) return;
      const next = Math.min(current + 1, target);
      setScanLoading({ progress: next });
    }, 28);

    return () => clearInterval(timer);
  }, [targetProgress, scanLoading.progress, setScanLoading]);

  const advanceTo = useCallback((value: number) => {
    const bounded = Math.max(0, Math.min(100, Math.round(value)));
    setTargetProgress((current) => (bounded > current ? bounded : current));

    return new Promise<void>((resolve) => {
      if (progressRef.current >= bounded) {
        resolve();
        return;
      }

      const watcher = setInterval(() => {
        if (progressRef.current >= bounded) {
          clearInterval(watcher);
          resolve();
        }
      }, 20);
    });
  }, []);

  const startDrift = useCallback((maxCap: number) => {
    const drift = setInterval(() => {
      setTargetProgress((current) => {
        if (current >= maxCap) return current;
        return current + 1;
      });
    }, 180);

    return () => clearInterval(drift);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!scanId || !frontImageUri) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    resetScanLoading();
    setTargetProgress(0);
    setScanLoading({
      stage: ScanStage.Uploading,
      progress: 0,
      message: 'Uploading Tags...',
    });

    try {
      void advanceTo(10);

      if (isDemoScanMode()) {
        await completeDemoCapture(scanId, Boolean(backImageUri));
      } else {
        await Promise.all([
          uploadFrontImage(scanId, frontImageUri),
          backImageUri ? uploadBackImage(scanId, backImageUri) : Promise.resolve(),
        ]);
      }

      await advanceTo(35);

      setScanLoading({
        stage: ScanStage.AIProcessing,
        message: 'Processing Tag Details...',
      });
      const stopAiDrift = startDrift(74);
      const result = await analyzeScan(scanId);
      stopAiDrift();
      await advanceTo(75);

      setScanLoading({
        stage: ScanStage.PreparingResults,
        message: 'Loading Scanned Results...',
      });
      const stopPrepareDrift = startDrift(99);

      const flatData = result.structuredData ?? {};
      let adjustedScanData = applyClientFormulaRules(structuredDataToScanItem(flatData));
      const extractedKarat = resolveScannedKarat(adjustedScanData.karat, adjustedScanData.tunch);
      const fallbackKarat = extractedKarat || '18K';
      adjustedScanData = { ...adjustedScanData, karat: fallbackKarat };

      const hasLabourValues =
        Boolean(adjustedScanData.labourChargeAmount?.trim()) ||
        Boolean(adjustedScanData.labourPurityPercent?.trim());

      if (!hasLabourValues) {
        try {
          const labourRate = await fetchLabourRate();
          if (labourRate) {
            if (labourRate.chargeType === 'AMOUNT') {
              adjustedScanData = {
                ...adjustedScanData,
                labourChargeAmount: String(labourRate.value ?? ''),
                labourChargeUnit:
                  labourRate.rupeesUnit ?? adjustedScanData.labourChargeUnit,
                labourPurityPercent: '',
              };
            } else if (labourRate.chargeType === 'PERCENTAGE') {
              adjustedScanData = {
                ...adjustedScanData,
                labourPurityPercent: `${labourRate.value ?? ''}%`,
                labourChargeAmount: '',
              };
            }
          }
        } catch {
          // Ignore labour settings fetch errors and keep scanned values.
        }
      }

      if (!isDemoScanMode()) {
        try {
          await syncFormulaStoreFromApi();
        } catch {
          // Keep existing formula settings if sync fails.
        }
      }

      setUnknownFields(result.unknownFields ?? []);
      setStructuredData({ ...flatData, karat: fallbackKarat });
      updateScanData(adjustedScanData);

      stopPrepareDrift();
      await advanceTo(100);
      setScanLoading({
        stage: ScanStage.Completed,
        message: 'Loading Scanned Results...',
      });
      router.replace('/dashboard/scanner/review-results' as Href);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Scan processing failed. Please try again.';
      Alert.alert('Scan Error', message, [
        {
          text: 'Back to Capture',
          onPress: () => router.replace('/dashboard/scanner/barcode' as Href),
        },
      ]);
    }
  }, [
    scanId,
    frontImageUri,
    backImageUri,
    router,
    resetScanLoading,
    setScanLoading,
    advanceTo,
    startDrift,
    applyClientFormulaRules,
    setUnknownFields,
    setStructuredData,
    updateScanData,
  ]);

  useEffect(() => {
    void runAnalysis();
  }, [runAnalysis]);

  return (
    <View className="flex-1 bg-black">
      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/60" />
        <SafeAreaView className="flex-1 items-center justify-center">
          <UnifiedScanLoader progress={scanLoading.progress} stage={scanLoading.stage} />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
