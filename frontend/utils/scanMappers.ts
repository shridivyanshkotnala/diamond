import type { JewelleryType, ScanItemData, ScanMode } from '@/types/scanner';
import type {
  ApiJewelleryType,
  ApiScanType,
  ClarificationField,
  ConfirmedMapping,
  StructuredScanData,
} from '@/types/scanner';
import { buildQuality } from '@/utils/qualityUtils';
import { getClarificationFieldLabel } from '@/utils/clarificationFields';

const JEWELLERY_TYPE_TO_API: Record<JewelleryType, ApiJewelleryType> = {
  Diamond: 'DIAMOND',
  Gold: 'GOLD',
};

const API_FIELD_LABELS: Record<string, string> = {
  grossWeight: 'Gross Wt',
  netWeight: 'Net Wt',
  pureWeight: 'Pure Wt',
  purity: 'Purity / Tunch',
  diamondWeight: 'Diamond Wt',
  diamondPieces: 'Diamond Pieces',
  diamondRate: 'Diamond Rate',
  diamondQuality: 'Diamond Quality',
  diamondColor: 'Diamond Color',
  diamondClarity: 'Diamond Clarity',
  goldWeight: 'Gold Wt',
  goldRate: 'Gold Rate',
  goldQuality: 'Gold Quality',
  goldPieces: 'Gold Pieces',
  colorstoneWeight: 'CS Wt',
  colorstoneRate: 'CS Rate',
  colorstoneQuality: 'CS Quality',
  colorstoneColor: 'CS Color',
  colorstoneClarity: 'CS Clarity',
  labour: 'Labour',
  other: 'Other',
};

const SCAN_ITEM_TO_API: Partial<Record<keyof ScanItemData, string>> = {
  grossWt: 'grossWeight',
  netWt: 'netWeight',
  pureWt: 'pureWeight',
  tunch: 'purity',
  diamondWeight: 'diamondWeight',
  diamondColor: 'diamondColor',
  diamondClarity: 'diamondClarity',
  diamondPieces: 'diamondPieces',
  diamondRate: 'diamondRate',
  diamondQuality: 'diamondQuality',
  colorstoneWeight: 'colorstoneWeight',
  colorstoneColor: 'colorstoneColor',
  colorstoneClarity: 'colorstoneClarity',
  colorstoneRate: 'colorstoneRate',
  colorstoneQuality: 'colorstoneQuality',
  labour: 'labour',
};

const API_TO_SCAN_ITEM: Record<string, keyof ScanItemData> = {
  grossWeight: 'grossWt',
  netWeight: 'netWt',
  pureWeight: 'pureWt',
  purity: 'tunch',
  diamondWeight: 'diamondWeight',
  diamondColor: 'diamondColor',
  diamondClarity: 'diamondClarity',
  diamondPieces: 'diamondPieces',
  diamondRate: 'diamondRate',
  diamondQuality: 'diamondQuality',
  colorstoneWeight: 'colorstoneWeight',
  colorstoneColor: 'colorstoneColor',
  colorstoneClarity: 'colorstoneClarity',
  colorstoneRate: 'colorstoneRate',
  colorstoneQuality: 'colorstoneQuality',
  labour: 'labour',
};

export function toApiJewelleryType(type: JewelleryType): ApiJewelleryType {
  return JEWELLERY_TYPE_TO_API[type];
}

export function toApiScanType(mode: ScanMode): ApiScanType {
  return mode === 'both' ? 'BOTH_SIDES' : 'SINGLE_SIDE';
}

export function getApiFieldLabel(field: string, jewelleryType?: JewelleryType): string {
  if (jewelleryType) {
    return getClarificationFieldLabel(field, jewelleryType);
  }
  return API_FIELD_LABELS[field] ?? field;
}

/** API-mapped scan fields cleared before apply so stale demo defaults are not kept. */
export function structuredDataToScanItem(data: StructuredScanData): Partial<ScanItemData> {
  const result: Partial<ScanItemData> = {};

  for (const scanKey of Object.values(API_TO_SCAN_ITEM)) {
    result[scanKey] = '';
  }

  for (const [apiKey, value] of Object.entries(data)) {
    const scanKey = API_TO_SCAN_ITEM[apiKey];
    if (scanKey && value != null && String(value).trim() !== '') {
      result[scanKey] = String(value);
    }
  }

  if (result.diamondColor || result.diamondClarity) {
    result.diamondQuality = buildQuality(
      result.diamondColor ?? '',
      result.diamondClarity ?? '',
    );
  }

  if (result.colorstoneColor || result.colorstoneClarity) {
    result.colorstoneQuality = buildQuality(
      result.colorstoneColor ?? '',
      result.colorstoneClarity ?? '',
    );
  }

  return result;
}

export function scanItemToStructuredData(
  scanData: ScanItemData,
  existing: StructuredScanData = {},
): StructuredScanData {
  const result: StructuredScanData = { ...existing };
  for (const [scanKey, apiKey] of Object.entries(SCAN_ITEM_TO_API) as [keyof ScanItemData, string][]) {
    const value = scanData[scanKey];
    if (value) {
      result[apiKey] = value;
    }
  }
  return result;
}

export function buildConfirmedMappings(
  fields: ClarificationField[],
  selections: Record<string, { mappedField: string; description?: string }>,
): ConfirmedMapping[] {
  return fields.map((field) => ({
    abbreviation: field.abbreviation,
    mappedField: selections[field.abbreviation]?.mappedField ?? field.suggestedField,
    ...(selections[field.abbreviation]?.mappedField === 'other' &&
    selections[field.abbreviation]?.description
      ? { description: selections[field.abbreviation].description }
      : {}),
  }));
}
