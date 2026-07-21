import type { LabourChargeType, LabourRate } from '@/types/rates';

export interface LabourRateFormErrors {
  amount?: string;
  percentage?: string;
}

export function formatLabourRateDisplay(rate: LabourRate | null): string {
  if (!rate) return 'Empty';
  return `₹ ${rate.value.toLocaleString('en-IN')} (${rate.rupeesUnit || 'Per Gram'})`;
}

export function validateLabourRateAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) {
    return 'Enter a valid amount greater than 0.';
  }
  return null;
}

export function validateLabourRateForm(
  amount: string,
  _percentage: string,
): LabourRateFormErrors | null {
  const hasAmount = Boolean(amount.trim());

  if (hasAmount) {
    const amountError = validateLabourRateAmount(amount);
    if (amountError) return { amount: amountError };
    return null;
  }

  return null;
}

export function labourRateFormToPayload(
  amount: string,
  _percentage: string,
  rupeesUnit?: 'Per Gram' | 'Per 10 Gram',
): { chargeType: LabourChargeType; value: number; rupeesUnit?: 'Per Gram' | 'Per 10 Gram' } | null {
  const errors = validateLabourRateForm(amount, '');
  if (errors) return null;

  const hasAmount = Boolean(amount.trim());

  if (!hasAmount) {
    return {
      chargeType: 'NONE' as LabourChargeType,
      value: 0,
    };
  }

  if (hasAmount) {
    return {
      chargeType: 'AMOUNT',
      value: Number(amount.replace(/[^\d.]/g, '')),
      rupeesUnit,
    };
  }
  return null;
}

export function labourRateToFormValues(rate: LabourRate | null): {
  amount: string;
  percentage: string;
  rupeesUnit: 'Per Gram' | 'Per 10 Gram';
} {
  if (!rate) return { amount: '', percentage: '', rupeesUnit: 'Per Gram' };
  return { amount: String(rate.value), percentage: '', rupeesUnit: rate.rupeesUnit || 'Per Gram' };
}
