import type { StoneRate } from '@/types/rates';

export function formatStoneRatePerCt(rate: number): string {
  return `₹${rate.toLocaleString('en-IN')} / ct`;
}

export function displayStoneField(value: string): string {
  return value.trim() ? value.trim() : '—';
}

export function stoneRateKey(color: string, clarity: string): string {
  return `${color.trim().toLowerCase()}|${clarity.trim().toLowerCase()}`;
}

export function createLocalStoneRateId(): string {
  return `stone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function validateStoneRateForm(
  color: string,
  clarity: string,
  rateValue: string,
): { color?: string; clarity?: string; rate?: string } | null {
  const errors: { color?: string; clarity?: string; rate?: string } = {};
  const hasColor = Boolean(color.trim());
  const hasClarity = Boolean(clarity.trim());

  if (!hasColor && !hasClarity) {
    errors.color = 'Select at least Color or Clarity.';
    errors.clarity = 'Select at least Color or Clarity.';
  }

  const rate = Number(rateValue);
  if (!rateValue.trim() || !Number.isFinite(rate) || rate <= 0) {
    errors.rate = 'Enter a valid rate per ct.';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function findDuplicateStoneRate(
  rates: StoneRate[],
  color: string,
  clarity: string,
  excludeId?: string,
): boolean {
  const key = stoneRateKey(color, clarity);
  return rates.some(
    (item) => item.id !== excludeId && stoneRateKey(item.color, item.clarity) === key,
  );
}

export function stoneRateSummary(rate: StoneRate): string {
  const parts = [displayStoneField(rate.color), displayStoneField(rate.clarity)].filter(
    (part) => part !== '—',
  );
  const label = parts.length > 0 ? parts.join(' · ') : 'this rate';
  return `${label} (${formatStoneRatePerCt(rate.rate)})`;
}
