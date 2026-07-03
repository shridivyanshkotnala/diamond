import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { FormSection } from '@/components/scanner/FormSection';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  LABOUR_SECTION_HINT,
  LABOUR_VALIDATION_MESSAGE,
  type LabourChargeUnit,
} from '@/constants/labour';
import type { ScanItemData } from '@/types/scanner';
import { parseWeightValue } from '@/utils/formulaUtils';

export interface LaborSectionValues {
  labourPurityPercent: string;
  labourChargeAmount: string;
  labourChargeUnit: LabourChargeUnit;
}

interface LaborSectionProps {
  values: LaborSectionValues;
  onChange: (values: Partial<LaborSectionValues>) => void;
  showValidationError?: boolean;
  unitOptions?: LabourChargeUnit[];
  netWeightGrams?: string;
}

function sanitizePurityInput(text: string): string {
  const digits = text.replace(/[^0-9.]/g, '');
  if (!digits) return '';
  return `${digits}%`;
}

function sanitizeChargeAmount(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

function OrDivider() {
  return (
    <View className="my-4 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-sm font-bold uppercase tracking-wide text-text-muted">OR</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

function UnitDropdown({
  value,
  options,
  onChange,
  disabled,
}: {
  value: LabourChargeUnit;
  options: LabourChargeUnit[];
  onChange: (unit: LabourChargeUnit) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="min-w-[118px] flex-1">
      <Pressable
        onPress={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="h-11 flex-row items-center justify-between rounded-input border border-border bg-surface-input px-3"
      >
        <Text className="flex-1 text-xs text-text-primary" numberOfLines={1}>
          {value}
        </Text>
        <ChevronDown size={16} color="#757575" />
      </Pressable>
      {open && !disabled ? (
        <View className="absolute left-0 right-0 top-[46px] z-20 overflow-hidden rounded-input border border-border bg-white shadow-md">
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`px-3 py-3 ${option === value ? 'bg-primary/10' : 'bg-white'}`}
            >
              <Text
                className={`text-xs ${option === value ? 'font-semibold text-primary' : 'text-text-primary'}`}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function LaborSection({
  values,
  onChange,
  showValidationError = false,
  unitOptions = ['Per Gram', 'Per 10 Gram'],
  netWeightGrams = '',
}: LaborSectionProps) {
  const usePercentageMode = Boolean(values.labourPurityPercent.trim());
  const useFixedAmountMode = Boolean(values.labourChargeAmount.trim());

  const purityDisabled = useFixedAmountMode;
  const chargeDisabled = usePercentageMode;

  const netWt = parseWeightValue(netWeightGrams);

  const computedLaborAmount = useMemo(() => {
    if (usePercentageMode) return 0;
    if (useFixedAmountMode) {
      const rate = Number(values.labourChargeAmount) || 0;
      if (values.labourChargeUnit === 'Per 10 Gram') {
        return netWt * (rate / 10);
      }
      return netWt * rate;
    }
    return 0;
  }, [usePercentageMode, useFixedAmountMode, netWt, values.labourChargeAmount, values.labourChargeUnit]);

  const handlePurityChange = (text: string) => {
    const next = sanitizePurityInput(text);
    if (!next) {
      onChange({ labourPurityPercent: '' });
      return;
    }
    onChange({
      labourPurityPercent: next,
      labourChargeAmount: '',
    });
  };

  const handleChargeChange = (text: string) => {
    const next = sanitizeChargeAmount(text);
    if (!next) {
      onChange({ labourChargeAmount: '' });
      return;
    }
    onChange({
      labourChargeAmount: next,
      labourPurityPercent: '',
    });
  };

  const handleUnitChange = (labourChargeUnit: LabourChargeUnit) => {
    if (chargeDisabled) return;
    onChange({ labourChargeUnit });
  };

  return (
    <FormSection title="Labour Charges">
      <Text className="mb-4 text-xs leading-5 text-text-secondary">{LABOUR_SECTION_HINT}</Text>

      <View
        className={`rounded-input border border-border bg-white p-3.5 ${
          purityDisabled ? 'opacity-45' : ''
        }`}
      >
        <Text className="mb-1 text-sm font-semibold text-text-primary">
          Case I — % Purity Mode
        </Text>
        <Text className="mb-2 text-[10px] leading-4 text-text-muted">
          Custom % overrides pure wt; labour charge prints as ₹0
        </Text>
        <TextInput
          value={values.labourPurityPercent}
          onChangeText={handlePurityChange}
          placeholder="Enter %"
          editable={!purityDisabled}
          placeholderTextColor={Colors.placeholder}
          keyboardType="decimal-pad"
          className="h-11 rounded-input border border-border bg-surface-input px-3.5 text-sm text-text-primary"
        />
      </View>

      <OrDivider />

      <View
        className={`rounded-input border border-border bg-white p-3.5 ${
          chargeDisabled ? 'opacity-45' : ''
        }`}
      >
        <Text className="mb-1 text-sm font-semibold text-text-primary">
          Case II — Fixed Amount Mode
        </Text>
        <Text className="mb-2 text-[10px] leading-4 text-text-muted">
          Labour = Net wt (gms) × rate per unit
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="h-11 min-w-0 flex-1 flex-row items-center rounded-input border border-border bg-surface-input px-3.5">
            <Text className="mr-1.5 text-sm font-medium text-text-muted">₹</Text>
            <TextInput
              value={values.labourChargeAmount}
              onChangeText={handleChargeChange}
              placeholder="Enter amount"
              editable={!chargeDisabled}
              placeholderTextColor={Colors.placeholder}
              keyboardType="number-pad"
              className="flex-1 text-sm text-text-primary"
            />
          </View>
          <UnitDropdown
            value={values.labourChargeUnit}
            options={unitOptions}
            onChange={handleUnitChange}
            disabled={chargeDisabled}
          />
        </View>
        {useFixedAmountMode && netWt > 0 ? (
          <Text className="mt-2 text-[10px] text-text-muted">
            {netWt} g × ₹{values.labourChargeAmount} ({values.labourChargeUnit})
          </Text>
        ) : null}
      </View>

      <View className="mt-4 rounded-input border border-primary/20 bg-primary/5 px-3.5 py-3">
        <Text className="mb-1 text-xs font-semibold text-text-secondary">
          Computed Labour Charge
        </Text>
        <Text className="text-lg font-bold text-text-primary">
          {formatInr(computedLaborAmount)}
        </Text>
        {usePercentageMode ? (
          <Text className="mt-1 text-[10px] text-text-muted">
            Percentage purity mode active — labour forced to ₹0
          </Text>
        ) : null}
      </View>

      {showValidationError && (!usePercentageMode && !useFixedAmountMode) ? (
        <Text className="mt-3 text-xs leading-5 text-danger-text">
          {LABOUR_VALIDATION_MESSAGE}
        </Text>
      ) : null}
    </FormSection>
  );
}

export function getLaborValuesFromScanData(
  scanData: Pick<ScanItemData, 'labourPurityPercent' | 'labourChargeAmount' | 'labourChargeUnit'>,
): LaborSectionValues {
  return {
    labourPurityPercent: scanData.labourPurityPercent || '',
    labourChargeAmount: scanData.labourChargeAmount || '',
    labourChargeUnit: scanData.labourChargeUnit || 'Per Gram',
  };
}
