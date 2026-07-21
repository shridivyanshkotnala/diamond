import { Text, View } from 'react-native';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { DEFAULT_LABOUR_CHARGE_UNIT, DEFAULT_LABOUR_WEIGHT_BASIS } from '@/constants/labour';
import type { LabourChargeUnit, LabourWeightBasis } from '@/constants/labour';
import type { ScanItemData } from '@/types/scanner';
import {
  computeLabourAmount,
  formatIndianCurrency,
  formatWeightGrams,
} from '@/utils/scanPriceCalculation';
import { parseWeightValue } from '@/utils/formulaUtils';
import { parseNumericLabourValue } from '@/utils/labourUtils';

export interface LaborSectionValues {
  labourChargeAmount: string;
  labourChargeUnit: LabourChargeUnit;
  labourWeightBasis: LabourWeightBasis;
  grossWt: string;
  netWt: string;
}

interface LaborSectionProps {
  values: LaborSectionValues;
  onChange?: (values: Partial<LaborSectionValues>) => void;
}

export function getLaborValuesFromScanData(scanData: ScanItemData): LaborSectionValues {
  return {
    labourChargeAmount: scanData.labourChargeAmount,
    labourChargeUnit: scanData.labourChargeUnit || DEFAULT_LABOUR_CHARGE_UNIT,
    labourWeightBasis: scanData.labourWeightBasis || DEFAULT_LABOUR_WEIGHT_BASIS,
    grossWt: scanData.grossWt,
    netWt: scanData.netWt,
  };
}

export function LaborSection({ values, onChange }: LaborSectionProps) {
  const grossWtGrams = parseWeightValue(values.grossWt);
  const netWtGrams = parseWeightValue(values.netWt);
  const basis = values.labourWeightBasis || DEFAULT_LABOUR_WEIGHT_BASIS;
  const weightUsed = basis === 'gross' ? grossWtGrams : netWtGrams;
  const weightLabel = basis === 'gross' ? 'Gross Wt' : 'Net Wt';

  const labour = computeLabourAmount(
    {
      labourChargeAmount: values.labourChargeAmount,
      labourChargeUnit: values.labourChargeUnit,
      labourWeightBasis: values.labourWeightBasis,
    },
    netWtGrams,
    grossWtGrams,
  );

  const amountValue = parseNumericLabourValue(values.labourChargeAmount) ?? '';

  return (
    <FormSection title="Labour" variant="card">
      <FormFieldGrid>
        <FormFieldGridItem>
          <FormInput
            label="Labour Rate (₹)"
            value={amountValue ? String(amountValue) : ''}
            onChangeText={(value) => onChange?.({ labourChargeAmount: value })}
            placeholder="Enter rate"
            keyboardType="decimal-pad"
            containerClassName="mb-2"
          />
          <Text className="mb-2 text-[10px] text-text-muted">Unit: {values.labourChargeUnit}</Text>
        </FormFieldGridItem>
        <FormFieldGridItem>
          <View className="mb-2">
            <FieldLabel label="Weight Used" />
            <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
              <Text className="text-sm text-text-primary">
                {weightUsed > 0 ? `${formatWeightGrams(weightUsed)} (${weightLabel})` : '—'}
              </Text>
            </View>
          </View>
        </FormFieldGridItem>
        <FormFieldGridItem fullWidth>
          <View className="mb-2">
            <FieldLabel label="Final Labour Amount" />
            <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
              <Text className="text-sm font-semibold text-text-primary">
                {labour.amount > 0 ? formatIndianCurrency(labour.amount) : '—'}
              </Text>
            </View>
          </View>
        </FormFieldGridItem>
      </FormFieldGrid>
    </FormSection>
  );
}
