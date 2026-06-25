import type { JewelleryType, ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';
import type { WishlistItem, WishlistItemSnapshot } from '@/types/wishlist';
import { resolveScannedKarat } from '@/utils/formulaUtils';
import {
  computeFinalTabPricing,
  computeGoldAmountWithPurityOverride,
  type FinalTabPricingResult,
  withStoneRows,
} from '@/utils/scanPriceCalculation';
import {
  buildDisplayStoneBlocks,
  buildStoneAmountRow,
  parseStoneArraysFromStructuredData,
} from '@/utils/stoneSequenceUtils';

function generateWishlistId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildTagCode(selectedType: JewelleryType, sku?: string): string {
  const trimmed = sku?.trim();
  if (trimmed) return trimmed.toUpperCase();

  const prefix = selectedType === 'Diamond' ? 'DIA' : 'GOL';
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-RP-${year}-${suffix}`;
}

export function buildWishlistTitle(selectedType: JewelleryType, scanData: ScanItemData): string {
  if (selectedType === 'Diamond') return 'Diamond';
  const karat = resolveScannedKarat(scanData.karat, scanData.tunch);
  return karat ? `Gold (${karat})` : 'Gold';
}

export function formatWishlistPriceBadge(
  selectedType: JewelleryType,
  pricing: FinalTabPricingResult,
): string {
  if (selectedType === 'Diamond') {
    const amount = Math.round(pricing.ultimateMrp).toLocaleString('en-IN');
    return `₹ ${amount}/ct (Including Tax)`;
  }

  const rate = Math.round(pricing.goldRatePerGram || 0).toLocaleString('en-IN');
  return `₹ ${rate}/g (Including Tax)`;
}

export function formatWishlistTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const time = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${time} | ${month}-${day}-${year}`;
}

export function computeWishlistPricing(
  scanData: ScanItemData,
  structuredData: StructuredScanData,
  selectedType: JewelleryType,
): FinalTabPricingResult {
  const { diamonds, colorstones } = parseStoneArraysFromStructuredData(structuredData, scanData);
  const stoneBlocks = buildDisplayStoneBlocks(diamonds, colorstones);
  const stoneRows = stoneBlocks.map((block) =>
    buildStoneAmountRow(
      block.sequenceIndex,
      block.displayTitle,
      block.stoneType,
      block.entry,
    ),
  );

  const selectedKarat = resolveScannedKarat(scanData.karat, scanData.tunch) || '18K';
  const base = computeFinalTabPricing({
    scanData,
    structuredData,
    selectedKarat,
  });

  return withStoneRows(base, stoneRows);
}

export function buildWishlistSnapshot(input: {
  scanData: ScanItemData;
  structuredData: StructuredScanData;
  selectedType: JewelleryType;
  diamonds: StoneEntry[];
  colorstones: StoneEntry[];
  pricing: FinalTabPricingResult;
}): WishlistItemSnapshot {
  const selectedKarat = resolveScannedKarat(input.scanData.karat, input.scanData.tunch) || '18K';
  const goldMetrics = computeGoldAmountWithPurityOverride({
    netWtGrams: input.pricing.netWtGrams,
    scanData: input.scanData,
    selectedKarat,
    goldRatePerGram: input.pricing.goldRatePerGram,
  });

  return {
    scanData: { ...input.scanData },
    structuredData: { ...input.structuredData },
    selectedType: input.selectedType,
    diamonds: input.diamonds.map((entry) => ({ ...entry })),
    colorstones: input.colorstones.map((entry) => ({ ...entry })),
    ultimateMrp: input.pricing.ultimateMrp,
    goldBasePrice: goldMetrics.goldAmount,
    goldRatePerGram: input.pricing.goldRatePerGram,
    pureWtGrams: goldMetrics.pureWtGrams,
    effectivePurityPercent: goldMetrics.purityPercent,
    usedLaborPurityOverride: goldMetrics.usedLaborOverride,
  };
}

export function buildWishlistItem(input: {
  scanData: ScanItemData;
  structuredData: StructuredScanData;
  selectedType: JewelleryType;
  diamonds: StoneEntry[];
  colorstones: StoneEntry[];
  pricing?: FinalTabPricingResult;
}): WishlistItem {
  const pricing =
    input.pricing ??
    computeWishlistPricing(input.scanData, input.structuredData, input.selectedType);

  const snapshot = buildWishlistSnapshot({ ...input, pricing });

  return {
    id: generateWishlistId(),
    title: buildWishlistTitle(input.selectedType, input.scanData),
    tagCode: buildTagCode(input.selectedType, input.scanData.sku),
    priceBadge: formatWishlistPriceBadge(input.selectedType, pricing),
    addedAt: new Date().toISOString(),
    snapshot,
  };
}
