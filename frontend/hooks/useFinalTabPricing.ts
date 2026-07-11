import { useState, useEffect } from 'react';
import type { GoldRate } from '@/types/rates';
import type { JewelleryType, ScanItemData, StructuredScanData, CalculateMrpPayload, CalculateMrpResponse } from '@/types/scanner';
import { resolveScannedKarat } from '@/utils/formulaUtils';
import { buildDisplayStoneBlocks, parseStoneArraysFromStructuredData } from '@/utils/stoneSequenceUtils';
import {
  computeLabourAmount,
  formatIndianCurrency,
  formatWeightGrams,
  parseNumericValue,
  type FinalTabPricingResult,
  type StoneAmountRow,
} from '@/utils/scanPriceCalculation';
import { parseWeightValue } from '@/utils/formulaUtils';
import { calculateScanMrp } from '@/utils/scanApi';
import { useScannerStore } from '@/store/scannerStore';

export interface UseFinalTabPricingOptions {
  scanData: ScanItemData;
  structuredData?: StructuredScanData;
  selectedType: JewelleryType;
  goldRates?: GoldRate[];
  selectedKarat?: string;
}

// Fallback empty state while loading
const defaultPricing: FinalTabPricingResult = {
  grossWtDisplay: '—',
  netWtGrams: 0,
  netWtDisplay: '—',
  selectedKarat: '18K',
  effectivePurityPercent: 0,
  puritySource: 'karatMapping',
  pureWtGrams: 0,
  pureWtDisplay: '—',
  goldRatePerGram: 0,
  goldBasePrice: 0,
  goldBasePriceDisplay: '₹0',
  stoneRows: [],
  totalStoneAmount: 0,
  labourInputMode: 'none',
  usePercentageMode: false,
  useFixedAmountMode: false,
  labourAmount: 0,
  labourDisplay: '—',
  otherChargesAmount: 0,
  otherChargesDisplay: '—',
  ultimateMrp: 0,
  ultimateMrpDisplay: '₹0',
};

export function useFinalTabPricing({
  scanData,
  structuredData,
  selectedType,
  selectedKarat,
}: UseFinalTabPricingOptions): FinalTabPricingResult {
  const scanId = useScannerStore((s) => s.scanId);
  const mrpRefreshToken = useScannerStore((s) => s.mrpRefreshToken);
  const [pricing, setPricing] = useState<FinalTabPricingResult>(defaultPricing);

  useEffect(() => {
    if (!scanId) return;

    let isMounted = true;
    const resolvedKarat = selectedKarat || resolveScannedKarat(scanData.karat, scanData.tunch) || '18K';
    const { diamonds, colorstones } = parseStoneArraysFromStructuredData(structuredData ?? {}, scanData);
    
    const payload: CalculateMrpPayload = {
      jewelleryType: selectedType,
      netWt: parseNumericValue(scanData.netWt) || 0,
      purityKarat: resolvedKarat,
      customPurityPercent: parseNumericValue(scanData.customPurityPercent),
      labourPurityPercent: scanData.labourPurityPercent,
      labourChargeAmount: scanData.labourChargeAmount,
      labourChargeUnit: scanData.labourChargeUnit,
      calculationMode: scanData.calculationRate,
      otherCharges: parseNumericValue(scanData.otherChargesAmount),
      diamonds: diamonds.map(d => ({ weight: parseNumericValue(d.weight) || 0, rate: parseNumericValue(d.rate) || 0 })),
      colorstones: colorstones.map(c => ({ weight: parseNumericValue(c.weight) || 0, rate: parseNumericValue(c.rate) || 0 })),
    };



    calculateScanMrp(scanId, payload)
      .then((res: CalculateMrpResponse) => {
        if (!isMounted) return;
        
        const stoneBlocks = buildDisplayStoneBlocks(diamonds, colorstones);
        const stoneRows: StoneAmountRow[] = stoneBlocks.map(block => {
            const wt = parseNumericValue(block.entry.weight) || 0;
            const rt = parseNumericValue(block.entry.rate) || 0;
            const rowAmt = wt * rt;
            return {
              sequenceIndex: block.sequenceIndex,
              displayTitle: block.displayTitle,
              stoneType: block.stoneType,
              rate: `₹${block.entry.rate}/ct`,
              quality: block.entry.quality || '—',
              weight: `${block.entry.weight} ct`,
              amount: rowAmt,
              amountDisplay: formatIndianCurrency(rowAmt),
            };
        });

        const grossWtGrams = parseWeightValue(scanData.grossWt);
        const netWtGrams = payload.netWt;
        const labour = computeLabourAmount(
          {
            labourPurityPercent: scanData.labourPurityPercent,
            labourChargeAmount: scanData.labourChargeAmount,
            labourChargeUnit: scanData.labourChargeUnit,
            labourWeightBasis: scanData.labourWeightBasis,
          },
          netWtGrams,
          grossWtGrams,
        );
        const adjustedMrp =
          res.finalMRP - (res.breakdown.labourAmount || 0) + labour.amount;

        setPricing({
          grossWtDisplay: scanData.grossWt || '—',
          netWtGrams,
          netWtDisplay: formatWeightGrams(netWtGrams),
          selectedKarat: resolvedKarat,
          effectivePurityPercent: 0,
          puritySource: 'karatMapping',
          pureWtGrams: res.breakdown.pureWeight,
          pureWtDisplay: formatWeightGrams(res.breakdown.pureWeight),
          goldRatePerGram: res.breakdown.goldRateApplied,
          goldBasePrice: res.breakdown.goldAmount,
          goldBasePriceDisplay: formatIndianCurrency(res.breakdown.goldAmount),
          stoneRows,
          totalStoneAmount: res.breakdown.diamondAmount + res.breakdown.colorstoneAmount,
          labourInputMode: labour.mode,
          usePercentageMode: labour.mode === 'percentage',
          useFixedAmountMode: labour.mode === 'fixedAmount',
          labourAmount: labour.amount,
          labourDisplay: formatIndianCurrency(labour.amount),
          otherChargesAmount: res.breakdown.otherCharges ?? 0,
          otherChargesDisplay: formatIndianCurrency(res.breakdown.otherCharges ?? 0),
          ultimateMrp: adjustedMrp,
          ultimateMrpDisplay: formatIndianCurrency(adjustedMrp),
        });
      })
      .catch(err => {
        console.error("Failed to calculate MRP via backend", err);
      });

    return () => {
      isMounted = false;
    };
  }, [scanId, scanData, structuredData, selectedType, selectedKarat, mrpRefreshToken]);

  return pricing;
}
