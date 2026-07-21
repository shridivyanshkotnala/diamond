import { useCallback, useEffect, useMemo, useRef } from 'react';
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

  const sleep = useCallback((ms: number) => new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, ms);
  }), []);

  const setProgress = useCallback(
    (value: number) => {
      const bounded = Math.max(0, Math.min(100, Math.round(value)));
      const current = progressRef.current;
      if (bounded <= current) return;
      progressRef.current = bounded;
      setScanLoading({ progress: bounded });
    },
    [setScanLoading],
  );

  const advanceWithSteps = useCallback(
    async (steps: number[], delayMs = 110) => {
      for (const step of steps) {
        setProgress(step);
        await sleep(delayMs);
      }
    },
    [setProgress, sleep],
  );

  const startSequenceDrift = useCallback(
    (steps: number[], intervalMs = 220) => {
      let index = 0;
      const timer = setInterval(() => {
        if (index >= steps.length) {
          clearInterval(timer);
          return;
        }

        const next = steps[index];
        index += 1;
        setProgress(next);
      }, intervalMs);

      return () => clearInterval(timer);
    },
    [setProgress],
  );

  const runAnalysis = useCallback(async () => {
    if (!scanId || !frontImageUri) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    resetScanLoading();
    progressRef.current = 0;
    setScanLoading({
      stage: ScanStage.Uploading,
      progress: 0,
      message: 'Uploading Tags...',
    });

    try {
      const stopUploadDrift = startSequenceDrift([1, 9, 17, 25, 33], 170);

      if (isDemoScanMode()) {
        await completeDemoCapture(scanId, Boolean(backImageUri));
      } else {
        await Promise.all([
          uploadFrontImage(scanId, frontImageUri),
          backImageUri ? uploadBackImage(scanId, backImageUri) : Promise.resolve(),
        ]);
      }

      stopUploadDrift();
      await advanceWithSteps([9, 17, 25, 33, 35], 70);

      setScanLoading({
        stage: ScanStage.AIProcessing,
        message: 'Processing Tag Details...',
      });
      const stopAiDrift = startSequenceDrift([40, 45, 50, 55, 60, 65, 70, 74], 220);
      const result = await analyzeScan(scanId);
      stopAiDrift();
      await advanceWithSteps([75], 70);

      setScanLoading({
        stage: ScanStage.PreparingResults,
        message: 'Loading Scanned Results...',
      });
      const stopPrepareDrift = startSequenceDrift([85, 91, 99], 160);

      const flatData = result.structuredData ?? {};
      let adjustedScanData = applyClientFormulaRules(structuredDataToScanItem(flatData));
      const extractedKarat = resolveScannedKarat(adjustedScanData.karat, adjustedScanData.tunch);
      const fallbackKarat = extractedKarat || '18K';
      adjustedScanData = { ...adjustedScanData, karat: fallbackKarat };

      const hasLabourValues = Boolean(adjustedScanData.labourChargeAmount?.trim());

      if (!hasLabourValues) {
        try {
          const labourRate = await fetchLabourRate();
          if (labourRate) {
            // Only support AMOUNT type - percentage type removed
            if (labourRate.chargeType === 'AMOUNT') {
              adjustedScanData = {
                ...adjustedScanData,
                labourChargeAmount: String(labourRate.value ?? ''),
                labourChargeUnit:
                  labourRate.rupeesUnit ?? adjustedScanData.labourChargeUnit,
                labourPurityPercent: '',
              };
            }
            // Percentage type no longer supported - ignore it
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
      await advanceWithSteps([85, 91, 99, 100], 80);
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
    advanceWithSteps,
    startSequenceDrift,
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
