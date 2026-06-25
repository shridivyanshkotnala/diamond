import type { JewelleryType, ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';

export interface WishlistItemSnapshot {
  scanData: ScanItemData;
  structuredData: StructuredScanData;
  selectedType: JewelleryType;
  diamonds: StoneEntry[];
  colorstones: StoneEntry[];
  ultimateMrp: number;
  goldBasePrice: number;
  goldRatePerGram: number;
  pureWtGrams: number;
  effectivePurityPercent: number;
  usedLaborPurityOverride: boolean;
}

export interface WishlistItem {
  id: string;
  title: string;
  tagCode: string;
  priceBadge: string;
  addedAt: string;
  snapshot: WishlistItemSnapshot;
}
