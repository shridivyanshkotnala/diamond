import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ReviewScannedResultsModal } from '@/components/scanner/ReviewScannedResultsModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { isDemoScanMode } from '@/constants/scanMode';
import { useFinalTabPricing } from '@/hooks/useFinalTabPricing';
import { useScannerStore } from '@/store/scannerStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { fetchEmployeePermissions } from '@/utils/authApi';
import { mapApiPermissionsToEmployee } from '@/utils/employeeApi';
import type { EmployeePermissions } from '@/types/employee';
import type { ScanItemData, StoneEntry } from '@/types/scanner';
import { scanItemToStructuredData } from '@/utils/scanMappers';
import {
  applyStoneEntriesToScanData,
  parseStoneArraysFromStructuredData,
  stoneEntriesToStructuredData,
} from '@/utils/stoneSequenceUtils';
import { buildWishlistItem } from '@/utils/wishlistUtils';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

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
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [hasAddedToWishlist, setHasAddedToWishlist] = useState(false);
  const [employeePermissions, setEmployeePermissions] = useState<EmployeePermissions | null>(null);

  useEffect(() => {
    let active = true;
    if (userRole !== 'employee' || isSuper) {
      setEmployeePermissions(null);
      return () => {
        active = false;
      };
    }

    const loadPermissions = async () => {
      const result = await fetchEmployeePermissions();
      if (!active) return;
      if (result.success && result.data?.permissions) {
        const mappedPermissions = mapApiPermissionsToEmployee(result.data.permissions);
        setEmployeePermissions(mappedPermissions);

        const allowRtgs = mappedPermissions.scan_rate_rtgs === true;
        const allowCash = mappedPermissions.scan_rate_cash === true;
        if (allowRtgs !== allowCash) {
          const forcedRate = allowCash ? 'cash' : 'rtgs';
          updateScanData({ calculationRate: forcedRate });
        }
        return;
      }
      setEmployeePermissions(null);
    };

    void loadPermissions();
    return () => {
      active = false;
    };
  }, [userRole, isSuper, updateScanData]);

  const isEmployeeRestricted = userRole === 'employee' && !isSuper;
  const canEditPurityPercent =
    !isEmployeeRestricted || employeePermissions?.scan_edit_purity_percent === true;
  const calculationRateAccess = useMemo(() => {
    if (!isEmployeeRestricted) return 'both' as const;
    if (!employeePermissions) return 'rtgs' as const;
    const allowRtgs = employeePermissions?.scan_rate_rtgs === true;
    const allowCash = employeePermissions?.scan_rate_cash === true;
    if (allowRtgs && allowCash) return 'both' as const;
    if (allowRtgs) return 'rtgs' as const;
    if (allowCash) return 'cash' as const;
    return 'both' as const;
  }, [employeePermissions, isEmployeeRestricted]);

  const livePricing = useFinalTabPricing({
    scanData,
    structuredData,
    selectedType,
  });

  const { diamonds, colorstones } = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  useEffect(() => {
    if (!scanId) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    if (!Object.keys(structuredData).length && !isDemoScanMode()) {
      router.replace('/dashboard/scanner/processing' as Href);
    }
  }, [scanId, structuredData, router]);

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
            <View className="w-full">
              <ReviewScannedResultsModal
                scanData={scanData}
                structuredData={structuredData}
                jewelleryType={selectedType}
                pricing={livePricing}
                onFieldChange={handleFieldChange}
                onStoneEntriesChange={handleStoneEntriesChange}
                onReScan={handleReScan}
                onGenerateInvoice={handleGenerateInvoice}
                onAddToWishlist={handleAddToWishlist}
                addingToWishlist={addingToWishlist}
                hasAddedToWishlist={hasAddedToWishlist}
                canEditPurityPercent={canEditPurityPercent}
                calculationRateAccess={calculationRateAccess}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
