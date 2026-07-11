import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';

import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { SearchableSelectDropdown } from '@/components/scanner/SearchableSelectDropdown';
import { useStoneRateFetch } from '@/hooks/useStoneRateFetch';
import { DIAMOND_SHAPE_OPTIONS } from '@/constants/stoneRateOptions';
import type { StoneKind } from '@/types/scanner';
import { buildQuality } from '@/utils/qualityUtils';
import { computeStoneAmount } from '@/utils/scanPriceCalculation';
import { parseNumericLabourValue } from '@/utils/labourUtils';

export interface StoneTypeRowValues {
  weight: string;
  color: string;
  clarity: string;
  quality: string;
  rate: string;
  shape?: string;
  packetCode?: string;
}

interface StoneTypeRowCardProps {
  title: string;
  stoneType: StoneKind;
  values: StoneTypeRowValues;
  editable?: boolean;
  onChange?: (values: Partial<StoneTypeRowValues>) => void;
  onRateErrorChange?: (hasError: boolean) => void;
  shapeOptions?: { value: string; label?: string }[];
}

const STONE_LABELS: Record<StoneKind, { rate: string; weight: string; amount: string }> = {
  diamond: {
    rate: 'Diamond Rate (₹/ct)',
    weight: 'Weight (CT)',
    amount: 'Diamond Amount',
  },
  colorstone: {
    rate: 'CS Rate (₹/ct)',
    weight: 'Weight (CT)',
    amount: 'CS Amount',
  },
};

function formatInr(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function StoneTypeRowCard({
  title,
  stoneType,
  values,
  editable = false,
  onChange,
  onRateErrorChange,
  shapeOptions,
}: StoneTypeRowCardProps) {
  const labels = STONE_LABELS[stoneType];
  const amount = computeStoneAmount(values.weight, values.rate);
  const resolvedShape = (() => {
    const raw = values.shape?.trim() ?? '';
    if (!raw) return '';
    if (raw.toLowerCase() === 'none') return '';
    const match = shapeOptions?.find((opt) => opt.value.toLowerCase() === raw.toLowerCase());
    return match?.value ?? raw;
  })();
  const dropdownOptions = (() => {
    const rawOptions = [
      { value: '', label: 'None' },
      ...(shapeOptions ?? DIAMOND_SHAPE_OPTIONS).map((opt) => ({
        value: opt.value,
        label: opt.label ?? opt.value,
      })),
    ];
    const seen = new Set<string>();
    return rawOptions.filter((option) => {
      const normalized = option.value.trim().toLowerCase();
      const key = normalized === 'none' ? '' : normalized;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const hasLookupCriteria =
    stoneType === 'diamond'
      ? Boolean(
          values.packetCode?.trim() ||
            resolvedShape.trim() ||
            values.color.trim() ||
            values.clarity.trim(),
        )
      : Boolean(values.color.trim() && values.clarity.trim());

  const handleRateFetched = useCallback(
    (fetchedRate: string) => {
      if (!fetchedRate) return;
      onChange?.({ rate: fetchedRate });
    },
    [onChange],
  );

  const { isFetching, rateNotFound } = useStoneRateFetch({
    type: stoneType,
    color: values.color,
    clarity: values.clarity,
    shape: stoneType === 'diamond' ? resolvedShape : undefined,
    packetCode: stoneType === 'diamond' ? values.packetCode : undefined,
    enabled: editable && hasLookupCriteria,
    onRateFetched: handleRateFetched,
  });

  useEffect(() => {
    const rateValue = parseNumericLabourValue(values.rate) ?? 0;
    const isError = rateNotFound && rateValue <= 0;
    onRateErrorChange?.(isError);
  }, [rateNotFound, values.rate, onRateErrorChange]);

  const handleColorChange = (color: string) => {
    onChange?.({ color, quality: buildQuality(color, values.clarity) });
  };

  const handleClarityChange = (clarity: string) => {
    onChange?.({ clarity, quality: buildQuality(values.color, clarity) });
  };

  return (
    <>
      <FormSection title={title} variant="card">
        <FormFieldGrid>
          {stoneType === 'diamond' ? (
            <FormFieldGridItem>
              <SearchableSelectDropdown
                label="Shape"
                value={resolvedShape}
                options={dropdownOptions}
                onChange={(shape) => onChange?.({ shape })}
                placeholder="None"
                containerClassName="mb-2.5"
              />
            </FormFieldGridItem>
          ) : null}
          <FormFieldGridItem>
            <FormInput
              label="Color"
              value={values.color}
              onChangeText={handleColorChange}
              editable={editable && !isFetching}
              placeholder="e.g. GH"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label="Clarity"
              value={values.clarity}
              onChangeText={handleClarityChange}
              editable={editable && !isFetching}
              placeholder="e.g. VVS"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label={labels.weight}
              value={values.weight}
              onChangeText={(weight) => onChange?.({ weight })}
              editable={editable && !isFetching}
              placeholder="from scan result"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label={labels.rate}
              value={values.rate}
              onChangeText={(text) => onChange?.({ rate: text.replace(/[^0-9.]/g, '') })}
              editable={editable && !isFetching}
              placeholder="Enter rate"
              keyboardType="decimal-pad"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <View className="mb-2.5">
              <Text className="mb-1.5 text-xs font-medium text-text-secondary">
                {labels.amount}
              </Text>
              <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="text-sm font-semibold text-text-primary">
                  {formatInr(amount)}
                </Text>
              </View>
            </View>
          </FormFieldGridItem>
        </FormFieldGrid>
      </FormSection>

    </>
  );
}
