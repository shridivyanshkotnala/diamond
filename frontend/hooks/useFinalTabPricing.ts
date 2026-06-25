import { useMemo } from 'react';

import type { GoldRate } from '@/types/rates';
import type { JewelleryType, ScanItemData, StructuredScanData } from '@/types/scanner';
import { resolveScannedKarat } from '@/utils/formulaUtils';
import {
  buildStoneAmountRow,
  computeFinalTabPricing,
  withStoneRows,
  type FinalTabPricingResult,
} from '@/utils/scanPriceCalculation';
import {
  buildDisplayStoneBlocks,
  parseStoneArraysFromStructuredData,
} from '@/utils/stoneSequenceUtils';

export interface UseFinalTabPricingOptions {
  scanData: ScanItemData;
  structuredData?: StructuredScanData;
  selectedType: JewelleryType;
  goldRates?: GoldRate[];
  selectedKarat?: string;
}

export function useFinalTabPricing({
  scanData,
  structuredData,
  selectedType,
  goldRates,
  selectedKarat,
}: UseFinalTabPricingOptions): FinalTabPricingResult {
  return useMemo(() => {
    const resolvedKarat =
      selectedKarat || resolveScannedKarat(scanData.karat, scanData.tunch);

    const { diamonds, colorstones } = parseStoneArraysFromStructuredData(
      structuredData ?? {},
      scanData,
    );
    const stoneBlocks = buildDisplayStoneBlocks(diamonds, colorstones);
    const stoneRows = stoneBlocks.map((block) =>
      buildStoneAmountRow(
        block.sequenceIndex,
        block.displayTitle,
        block.stoneType,
        block.entry,
      ),
    );

    const basePricing = computeFinalTabPricing({
      scanData,
      structuredData,
      goldRates,
      selectedKarat: resolvedKarat,
    });

    return withStoneRows(basePricing, stoneRows);
  }, [scanData, structuredData, selectedType, goldRates, selectedKarat]);
}
