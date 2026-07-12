import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ReviewScannedResultsModal } from '@/components/scanner/ReviewScannedResultsModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { MOCK_REVIEW_RESULTS } from '@/constants/scannerData';
import { isDemoScanMode } from '@/constants/scanMode';
import { useFinalTabPricing } from '@/hooks/useFinalTabPricing';
import { useFormulaStore } from '@/store/formulaStore';
import { useScannerStore } from '@/store/scannerStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import type { ScanItemData, StoneEntry } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { syncFormulaStoreFromApi } from '@/utils/formulaSettingsApi';
import {
  applyFormula2KaratConstraint,
  resolveScannedKarat,
} from '@/utils/formulaUtils';
import { getReview, submitReview } from '@/utils/scanApi';
import { fetchLabourRate } from '@/utils/ratesApi';
import { scanItemToStructuredData, structuredDataToScanItem } from '@/utils/scanMappers';
import { resolveCurrentEmployee } from '@/utils/settingsAccess';
import {
  applyStoneEntriesToScanData,
  parseStoneArraysFromStructuredData,
  stoneEntriesToStructuredData,
} from '@/utils/stoneSequenceUtils';
import { buildWishlistItem } from '@/utils/wishlistUtils';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

function applyClientFormulaRules(data: ScanItemData): ScanItemData {
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
}

export default function ReviewResultsScreen() {
  const router = useRouter();
  const scanId = useScannerStore((s) => s.scanId);
  const scanData = useScannerStore((s) => s.scanData);
  const selectedType = useScannerStore((s) => s.selectedType);
  const structuredData = useScannerStore((s) => s.structuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);
  const bumpMrpRefresh = useScannerStore((s) => s.bumpMrpRefresh);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const userRole = useAuthStore((s) => s.userRole);
  const isSuper = useAuthStore((s) => s.isSuper);
  const loggedInEmployeeId = useAuthStore((s) => s.loggedInEmployeeId);
  const savedPhone = useAuthStore((s) => s.savedPhone);
  const savedEmployeeEmail = useAuthStore((s) => s.savedEmployeeEmail);
  const employees = useEmployeeStore((s) => s.employees);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [hasAddedToWishlist, setHasAddedToWishlist] = useState(false);

  const employee = useMemo(
    () => resolveCurrentEmployee(employees, loggedInEmployeeId, savedPhone, savedEmployeeEmail),
    [employees, loggedInEmployeeId, savedPhone, savedEmployeeEmail],
  );
  const isEmployeeRestricted = userRole === 'employee' && !isSuper;
  const canEditPurityPercent =
    !isEmployeeRestricted || employee?.permissions.scan_edit_purity_percent === true;
  const calculationRateAccess = useMemo(() => {
    if (!isEmployeeRestricted) return 'both' as const;
    const allowRtgs = employee?.permissions.scan_rate_rtgs === true;
    const allowCash = employee?.permissions.scan_rate_cash === true;
    if (allowRtgs && allowCash) return 'both' as const;
    if (allowRtgs) return 'rtgs' as const;
    if (allowCash) return 'cash' as const;
    return 'both' as const;
  }, [employee?.permissions, isEmployeeRestricted]);

  const livePricing = useFinalTabPricing({
    scanData,
    structuredData,
    selectedType,
  });

  const { diamonds, colorstones } = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  const loadReview = useCallback(async () => {
    if (!scanId) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    setConfirmed(false);
    setHasAddedToWishlist(false);
    setAddingToWishlist(false);
    setLoading(true);
    try {
      if (!isDemoScanMode()) {
        try {
          await syncFormulaStoreFromApi();
        } catch {
          // Keep existing store values when formula settings cannot be loaded.
        }
      }

      const data = await getReview(scanId);
      const baseScanData = applyClientFormulaRules(structuredDataToScanItem(data.structuredData));
      let adjustedScanData =
        calculationRateAccess === 'both'
          ? baseScanData
          : {
              ...baseScanData,
              calculationRate: calculationRateAccess === 'cash' ? 'cash' : 'rtgs',
            };

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
          // Ignore labour settings fetch errors and keep scan values.
        }
      }
      setStructuredData(data.structuredData);
      updateScanData(adjustedScanData);
    } catch (error) {
      const existing = useScannerStore.getState().structuredData;
      if (Object.keys(existing).length > 0) {
        const baseScanData = applyClientFormulaRules(structuredDataToScanItem(existing));
        updateScanData(
          calculationRateAccess === 'both'
            ? baseScanData
            : {
                ...baseScanData,
                calculationRate: calculationRateAccess === 'cash' ? 'cash' : 'rtgs',
              },
        );
        return;
      }
      if (isDemoScanMode()) {
        const base = useScannerStore.getState().scanData;
        const demoScanData = applyClientFormulaRules({
          ...base,
          grossWt: MOCK_REVIEW_RESULTS.grossWt || '42.500',
          netWt: MOCK_REVIEW_RESULTS.netWt,
          tunch: MOCK_REVIEW_RESULTS.tunch,
          karat: resolveScannedKarat('', MOCK_REVIEW_RESULTS.tunch),
          diamondWeight: MOCK_REVIEW_RESULTS.diamondWeight,
          diamondColor: MOCK_REVIEW_RESULTS.diamondColor,
          diamondClarity: MOCK_REVIEW_RESULTS.diamondClarity,
          diamondPieces: MOCK_REVIEW_RESULTS.diamondPieces,
          diamondRate: MOCK_REVIEW_RESULTS.diamondRate,
          diamondQuality: MOCK_REVIEW_RESULTS.diamondQuality,
          colorstoneWeight: MOCK_REVIEW_RESULTS.colorstoneWeight,
          colorstoneColor: MOCK_REVIEW_RESULTS.colorstoneColor,
          colorstoneClarity: MOCK_REVIEW_RESULTS.colorstoneClarity,
          colorstoneQuality: MOCK_REVIEW_RESULTS.colorstoneQuality,
          colorstoneRate: MOCK_REVIEW_RESULTS.colorstoneRate,
          labourPurityPercent: MOCK_REVIEW_RESULTS.labourPurityPercent,
          labourChargeAmount: MOCK_REVIEW_RESULTS.labourChargeAmount,
          labourChargeUnit: MOCK_REVIEW_RESULTS.labourChargeUnit,
          otherChargesAmount: MOCK_REVIEW_RESULTS.otherChargesAmount,
          otherChargesItems: [],
          otherChargesRemarks: MOCK_REVIEW_RESULTS.otherChargesRemarks,
        });
        updateScanData(
          calculationRateAccess === 'both'
            ? demoScanData
            : {
                ...demoScanData,
                calculationRate: calculationRateAccess === 'cash' ? 'cash' : 'rtgs',
              },
        );
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Failed to load review data. Please try again.';
      Alert.alert('Review Error', message, [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [scanId, router, setStructuredData, updateScanData, calculationRateAccess]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleFieldChange = useCallback(
    (field: keyof ScanItemData, value: ScanItemData[keyof ScanItemData]) => {
      if (field === 'customPurityPercent' && !canEditPurityPercent) {
        return;
      }
    const updated = { ...useScannerStore.getState().scanData, [field]: value };
    updateScanData({ [field]: value });
    setStructuredData(
      scanItemToStructuredData(updated, useScannerStore.getState().structuredData),
    );
    if (field === 'calculationRate') {
      // ensure pricing is refreshed immediately when switching RTGS/Cash
      bumpMrpRefresh();
    }
  },
    [updateScanData, setStructuredData, bumpMrpRefresh, canEditPurityPercent],
  );

  useEffect(() => {
    if (!canEditPurityPercent && scanData.customPurityPercent.trim()) {
      handleFieldChange('customPurityPercent', '');
    }
  }, [canEditPurityPercent, scanData.customPurityPercent, handleFieldChange]);

  useEffect(() => {
    if (calculationRateAccess === 'both') return;
    const enforced = calculationRateAccess === 'cash' ? 'cash' : 'rtgs';
    if (scanData.calculationRate !== enforced) {
      handleFieldChange('calculationRate', enforced);
    }
  }, [calculationRateAccess, scanData.calculationRate, handleFieldChange]);

  const handleStoneEntriesChange = useCallback(
    (diamonds: StoneEntry[], colorstones: StoneEntry[]) => {
      const currentScanData = useScannerStore.getState().scanData;
      const currentStructuredData = useScannerStore.getState().structuredData;
      const stoneFields = applyStoneEntriesToScanData(currentScanData, diamonds, colorstones);
      const updatedScanData = { ...currentScanData, ...stoneFields };
      const nextStructuredData = stoneEntriesToStructuredData(
        currentStructuredData,
        diamonds,
        colorstones,
      );
      updateScanData(stoneFields);
      setStructuredData(scanItemToStructuredData(updatedScanData, nextStructuredData));
    },
    [setStructuredData, updateScanData],
  );


  const handleReScan = () => {
    setScanSide('front');
    router.push('/dashboard/scanner/barcode' as Href);
  };

  const handleConfirm = async () => {
    if (!scanId) return;

    const payload = scanItemToStructuredData(scanData, structuredData);
    setSubmitting(true);
    try {
      await submitReview(scanId, payload);
      setConfirmed(true);
    } catch (error) {
      if (isDemoScanMode()) {
        setConfirmed(true);
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Failed to approve scan. Please try again.';
      Alert.alert('Approval Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = () => {
    router.push('/dashboard/scanner/invoice-preview' as Href);
  };

  const handleAddToWishlist = async () => {
    if (addingToWishlist || hasAddedToWishlist) return;

    setAddingToWishlist(true);
    try {
      const item = buildWishlistItem({
        scanData,
        structuredData,
        selectedType,
        diamonds,
        colorstones,
        pricing: livePricing,
        scanTimestamp: new Date().toISOString(),
      });
      await addWishlistItem(item);
      setHasAddedToWishlist(true);
      Alert.alert('Wishlist', 'Item added to your wishlist.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to add item. Please try again.';
      Alert.alert('Wishlist Error', message);
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/50" />
        <SafeAreaView className="flex-1" edges={['top']}>
          <ScreenBackHeader iconColor="#9E9E9E" onBack={() => router.back()} />

          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow items-center justify-center px-screen pb-28 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#D4C19C" />
            ) : (
              <View className="w-full">
                <ReviewScannedResultsModal
                  scanData={scanData}
                  structuredData={structuredData}
                  jewelleryType={selectedType}
                  pricing={livePricing}
                  onFieldChange={handleFieldChange}
                  onStoneEntriesChange={handleStoneEntriesChange}
                  onReScan={handleReScan}
                  onConfirm={handleConfirm}
                  confirmed={confirmed}
                  onGenerateInvoice={handleGenerateInvoice}
                  onAddToWishlist={handleAddToWishlist}
                  addingToWishlist={addingToWishlist}
                  hasAddedToWishlist={hasAddedToWishlist}
                  confirming={submitting}
                  canEditPurityPercent={canEditPurityPercent}
                  calculationRateAccess={calculationRateAccess}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>

        {(loading || submitting) ? (
          <View className="absolute inset-0 z-50 flex-1 items-center justify-center bg-black/70">
            <ActivityIndicator size="large" color="#D4C19C" />
            <Text className="mt-4 text-lg font-bold text-white">
              {loading ? 'Loading Results...' : 'Processing...'}
            </Text>
          </View>
        ) : null}
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
