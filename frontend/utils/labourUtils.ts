import {
  DEFAULT_LABOUR_CHARGE_UNIT,
  DEFAULT_LABOUR_CHARGE_UNITS,
  LABOUR_VALIDATION_MESSAGE,
  type LabourChargeUnit,
} from '@/constants/labour';
import type { ScanItemData } from '@/types/scanner';

export function parseNumericLabourValue(raw: string): number | null {
  const cleaned = raw.replace(/[₹,%\s]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseChargeUnitFromText(raw: string): LabourChargeUnit {
  if (/per\s*10\s*gram/i.test(raw)) return 'Per 10 Gram';
  if (/per\s*1\s*gram/i.test(raw)) return 'Per 1 Gram';
  if (/per\s*gram/i.test(raw)) return 'Per Gram';
  return DEFAULT_LABOUR_CHARGE_UNIT;
}

export function parseLabourFromApi(labourRaw: string): Pick<
  ScanItemData,
  'labourChargeAmount' | 'labourChargeUnit'
> {
  const empty = {
    labourChargeAmount: '',
    labourChargeUnit: DEFAULT_LABOUR_CHARGE_UNIT,
  };

  if (!labourRaw?.trim()) return empty;

  const pipeParts = labourRaw.split('|');
  if (pipeParts.length === 2 && parseNumericLabourValue(pipeParts[0]) !== null) {
    const unit = DEFAULT_LABOUR_CHARGE_UNITS.includes(pipeParts[1].trim() as LabourChargeUnit)
      ? (pipeParts[1].trim() as LabourChargeUnit)
      : DEFAULT_LABOUR_CHARGE_UNIT;
    return {
      labourChargeAmount: String(parseNumericLabourValue(pipeParts[0])),
      labourChargeUnit: unit,
    };
  }

  const numericValue = parseNumericLabourValue(labourRaw);
  if (numericValue !== null && numericValue > 0 && numericValue <= 100 && /%/.test(labourRaw)) {
    return empty;
  }

  return {
    ...empty,
    labourChargeAmount: labourRaw.trim(),
  };
}

export function serializeLabourForApi(
  data: Pick<ScanItemData, 'labourChargeAmount' | 'labourChargeUnit'>,
): string {
  if (data.labourChargeAmount.trim()) {
    const amount = parseNumericLabourValue(data.labourChargeAmount);
    const amountStr = amount !== null ? String(amount) : data.labourChargeAmount.trim();
    return `${amountStr}|${data.labourChargeUnit}`;
  }
  return '';
}

export function formatLabourDisplay(
  data: Pick<ScanItemData, 'labourChargeAmount' | 'labourChargeUnit'>,
): string {
  if (data.labourChargeAmount.trim()) {
    const amount = parseNumericLabourValue(data.labourChargeAmount) ?? data.labourChargeAmount;
    return `₹${amount} ${data.labourChargeUnit}`;
  }
  return '';
}

export function hasActiveLabourCharge(
  data: Pick<ScanItemData, 'labourChargeAmount'>,
): boolean {
  return Boolean(data.labourChargeAmount.trim());
}

export function validateLabour(
  data: Pick<ScanItemData, 'labourChargeAmount'>,
): string | null {
  const hasCharge = hasActiveLabourCharge(data);
  if (!hasCharge) return LABOUR_VALIDATION_MESSAGE;
  return null;
}
