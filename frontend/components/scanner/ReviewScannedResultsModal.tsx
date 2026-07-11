import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { ScannerFinalTab } from '@/components/scanner/ScannerFinalTab';
import { PriceCard } from '@/components/scanner/PriceCard';
import { CalculationRateSection } from '@/components/scanner/CalculationRateSection';
import { useScannerStore } from '@/store/scannerStore';
import { RefreshCw } from 'lucide-react-native';
import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { useFormulaStore } from '@/store/formulaStore';
import type { ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';
import { DIAMOND_SHAPE_OPTIONS, type StoneSelectOption } from '@/constants/stoneRateOptions';
import { fetchDiamondRates, fetchGoldRates } from '@/utils/ratesApi';
import type { GoldRate, TaxSettings } from '@/types/rates';
import type { FinalTabPricingResult } from '@/utils/scanPriceCalculation';
import { computeOtherChargesTotal, parseNumericValue } from '@/utils/scanPriceCalculation';
import {
  applyFormula2KaratConstraint,
  computeNetWeightFallback,
  isKaratWhitelisted,
  resolveScannedKarat,
} from '@/utils/formulaUtils';

import {
  parseStoneArraysFromStructuredData,
  resolveStoneEntryArrays,
  sumStoneWeights,
  updateStoneEntryAtIndex,
} from '@/utils/stoneSequenceUtils';

interface ReviewScannedResultsModalProps {
  scanData: ScanItemData;
  structuredData: StructuredScanData;
  jewelleryType: 'Gold' | 'Diamond';
  onFieldChange: (field: keyof ScanItemData, value: ScanItemData[keyof ScanItemData]) => void;
  onStoneEntriesChange: (diamonds: StoneEntry[], colorstones: StoneEntry[]) => void;
  onReScan: () => void;
  onConfirm: () => void;
  onGenerateInvoice: () => void;
  onAddToWishlist: () => void;
  pricing: FinalTabPricingResult;
  confirmed: boolean;
  addingToWishlist?: boolean;
  hasAddedToWishlist?: boolean;
  confirming?: boolean;
  canEditPurityPercent?: boolean;
  calculationRateAccess?: 'rtgs' | 'cash' | 'both';
}

export function ReviewScannedResultsModal({
  scanData,
  structuredData,
  jewelleryType,
  onFieldChange,
  onStoneEntriesChange,
  onReScan,
  onConfirm,
  onGenerateInvoice,
  onAddToWishlist,
  pricing,
  confirmed,
  addingToWishlist = false,
  hasAddedToWishlist = false,
  confirming = false,
  canEditPurityPercent = true,
  calculationRateAccess = 'both',
}: ReviewScannedResultsModalProps) {
  const activeFormula = useFormulaStore((s) => s.activeFormula);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);

  const parsedStones = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  const [diamondEntries, setDiamondEntries] = useState<StoneEntry[]>(parsedStones.diamonds);
  const [colorstoneEntries, setColorstoneEntries] = useState<StoneEntry[]>(
    parsedStones.colorstones,
  );
  const [rateErrors, setRateErrors] = useState<Record<number, boolean>>({});
  const [diamondShapeOptions, setDiamondShapeOptions] = useState<StoneSelectOption[]>([
    { value: '', label: 'None' },
    ...DIAMOND_SHAPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
  ]);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [goldTaxSettings, setGoldTaxSettings] = useState<TaxSettings | undefined>();
  const [mcxLiveRate, setMcxLiveRate] = useState(0);

  const [karatDropdownMode, setKaratDropdownMode] = useState(false);
  const [useNetWtFormula, setUseNetWtFormula] = useState(!scanData.netWt);
  const wasNetWtScanned = useMemo(() => Boolean(scanData.netWt), []);

  const stoneDataKey = `${structuredData.diamonds ?? ''}|${structuredData.colorstones ?? ''}`;

  useEffect(() => {
    const parsed = parseStoneArraysFromStructuredData(structuredData, scanData);
    const resolved = resolveStoneEntryArrays(
      parsed.diamonds,
      parsed.colorstones,
      jewelleryType,
    );
    setDiamondEntries(resolved.diamonds);
    setColorstoneEntries(resolved.colorstones);
    setRateErrors({});
  }, [stoneDataKey, jewelleryType, structuredData, scanData]);

  useEffect(() => {
    let cancelled = false;

    fetchGoldRates()
      .then((response) => {
        if (cancelled) return;
        setGoldRates(response.rates ?? []);
        setGoldTaxSettings(response.taxSettings);
        setMcxLiveRate(response.mcxLiveRate ?? 0);
      })
      .catch(() => {
        if (cancelled) return;
        setGoldRates([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const baseOptions: StoneSelectOption[] = [
      { value: '', label: 'None' },
      ...DIAMOND_SHAPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    ];

    fetchDiamondRates()
      .then((rates) => {
        if (cancelled) return;
        const baseValues = new Set(baseOptions.map((opt) => opt.value.toLowerCase()));
        const customShapes = rates
          .map((rate) => rate.shape?.trim())
          .filter((shape): shape is string => Boolean(shape))
          .filter((shape) => !baseValues.has(shape.toLowerCase()))
          .map((shape) => ({ value: shape, label: shape }));

        setDiamondShapeOptions([...baseOptions, ...customShapes]);
      })
      .catch(() => {
        if (cancelled) return;
        setDiamondShapeOptions(baseOptions);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasRateError = Object.values(rateErrors).some(Boolean);
  const otherChargesAmount = computeOtherChargesTotal(scanData);
  const missingOtherChargesRemarks =
    otherChargesAmount > 0 && !scanData.otherChargesRemarks.trim();
  const canConfirm =
    Boolean(scanData.grossWt.trim()) && !hasRateError && !missingOtherChargesRemarks;

  useEffect(() => {
    const scannedKarat = resolveScannedKarat(scanData.karat, scanData.tunch);
    
    if (activeFormula === 'F2') {
      const { karat, requiresDropdown } = applyFormula2KaratConstraint(scannedKarat, formula2Rules);
      setKaratDropdownMode(requiresDropdown || !scannedKarat);
      if (requiresDropdown) {
        if (scanData.karat) onFieldChange('karat', '');
        return;
      }
      if (karat && karat !== scanData.karat) {
        onFieldChange('karat', karat);
      }
    } else {
      setKaratDropdownMode(!scannedKarat);
    }
  }, [activeFormula, formula2Rules, scanData.karat, scanData.tunch, onFieldChange]);

  useEffect(() => {
    if (!useNetWtFormula) return;
    const computed = computeNetWeightFallback(
      scanData.grossWt,
      sumStoneWeights(diamondEntries),
      sumStoneWeights(colorstoneEntries),
    );
    if (computed !== scanData.netWt) {
      onFieldChange('netWt', computed);
    }
  }, [
    useNetWtFormula,
    scanData.grossWt,
    diamondEntries,
    colorstoneEntries,
    scanData.netWt,
    onFieldChange,
  ]);

  const handleStoneEntryChange = useCallback(
    (stoneType: 'diamond' | 'colorstone', sourceIndex: number, values: Partial<StoneEntry>) => {
      if (stoneType === 'diamond') {
        const nextDiamonds = updateStoneEntryAtIndex(diamondEntries, sourceIndex, values);
        setDiamondEntries(nextDiamonds);
        onStoneEntriesChange(nextDiamonds, colorstoneEntries);
        return;
      }

      const nextColorstones = updateStoneEntryAtIndex(colorstoneEntries, sourceIndex, values);
      setColorstoneEntries(nextColorstones);
      onStoneEntriesChange(diamondEntries, nextColorstones);
    },
    [colorstoneEntries, diamondEntries, onStoneEntriesChange],
  );

  const handleStoneRateErrorChange = useCallback((sequenceIndex: number, hasError: boolean) => {
    setRateErrors((prev) => {
      if (prev[sequenceIndex] === hasError) return prev;
      return { ...prev, [sequenceIndex]: hasError };
    });
  }, []);

  const handleNetWtFormulaToggle = () => {
    const next = !useNetWtFormula;
    setUseNetWtFormula(next);
    if (!next) {
      onFieldChange('netWt', '');
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const requiresKaratSelection = !scanData.karat;

  return (
    <View className="rounded-[20px] bg-white px-screen py-5 shadow-lg">
      <Text className="mb-4 text-lg font-bold text-text-primary">
        Scanner Review Result 
      </Text>

      {!wasNetWtScanned ? (
        <Pressable
          onPress={handleNetWtFormulaToggle}
          className="mb-4 flex-row items-start gap-2.5 rounded-input border border-border bg-surface-muted px-3 py-3"
        >
          <View
            className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
              useNetWtFormula ? 'border-primary bg-primary' : 'border-border bg-white'
            }`}
          >
            {useNetWtFormula ? <Check size={12} color="#FFFFFF" /> : null}
          </View>
          <Text className="flex-1 text-xs leading-5 text-text-secondary">
            Use Net Wt = gross wt - 0.2 x (dia wt + colorstone wt)
          </Text>
        </Pressable>
      ) : null}

      {requiresKaratSelection && !scanData.karat ? (
        <Text className="mb-3 text-xs text-danger-text">
          Select a karat from Tunch Purity before confirming.
        </Text>
      ) : null}

      <ScannerFinalTab
        scanData={scanData}
        structuredData={structuredData}
        diamonds={diamondEntries}
        colorstones={colorstoneEntries}
        jewelleryType={jewelleryType}
        pricing={pricing}
        goldRates={goldRates}
        goldTaxSettings={goldTaxSettings}
        mcxLiveRate={mcxLiveRate}
        diamondShapeOptions={diamondShapeOptions}
        editable
        canEditPurityPercent={canEditPurityPercent}
        onFieldChange={onFieldChange}
        onStoneEntryChange={handleStoneEntryChange}
        onRateErrorChange={handleStoneRateErrorChange}
        showOtherChargesRemarksError={missingOtherChargesRemarks}
      />

      <CalculationRateSection
        value={scanData.calculationRate}
        onChange={(value) => onFieldChange('calculationRate', value)}
        access={calculationRateAccess}
      />

      {confirmed ? (
        <View className="mb-3">
          <View className="relative">
            <PriceCard
              label="Calculated MRP Of Jewellery"
              amount={pricing.ultimateMrpDisplay}
              subtitle="Final Jewellery MRP"
            />
            <Pressable
              onPress={() => useScannerStore.getState().bumpMrpRefresh()}
              className="absolute right-4 top-4 h-8 w-8 items-center justify-center rounded-full bg-white/10"
            >
              <RefreshCw size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {!confirmed ? (
        <View className="mt-2 flex-row gap-3">
          <Pressable
            onPress={onReScan}
            className="flex-1 items-center rounded-button border border-border bg-white py-3.5 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-text-secondary">ReScan</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            disabled={confirming || !canConfirm || (requiresKaratSelection && !scanData.karat)}
            className="flex-1 items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
          >
            {confirming ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">Confirm</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="mt-2 flex-row gap-3">
          <OutlineButton
            title={hasAddedToWishlist ? 'Item Added' : addingToWishlist ? 'Adding...' : 'Add to Wishlist'}
            onPress={onAddToWishlist}
            disabled={hasAddedToWishlist || addingToWishlist}
          />
          <PrimaryGreenButton title="Generate Invoice" onPress={onGenerateInvoice} />
        </View>
      )}

      {hasRateError ? (
        <Text className="mt-3 text-center text-xs leading-5 text-danger-text">
          Resolve rate errors before saving.
        </Text>
      ) : null}

      {missingOtherChargesRemarks ? (
        <Text className="mt-2 text-center text-xs leading-5 text-danger-text">
          Add remarks for other charges before confirming.
        </Text>
      ) : null}

      <Text className="mt-4 text-center text-xs leading-5 text-text-secondary">
        <Text className="text-danger-text">*</Text> Scanner couldn&apos;t scan or find specific value.
        Manually enter the value or ReScan.
      </Text>
    </View>
  );
}
