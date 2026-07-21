import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { FormSection } from '@/components/scanner/FormSection';
import { Colors } from '@/constants/theme';
import {
  LABOUR_WEIGHT_OPTIONS,
  type LabourChargeUnit,
  type LabourWeightBasis,
} from '@/constants/labour';
import type { ScanItemData } from '@/types/scanner';
import { parseWeightValue } from '@/utils/formulaUtils';

export interface LaborSectionValues {
  labourPurityPercent: string;
  labourChargeAmount: string;
  labourChargeUnit: LabourChargeUnit;
  labourWeightBasis: LabourWeightBasis;
}

interface LaborSectionProps {
  values: LaborSectionValues;
  onChange: (values: Partial<LaborSectionValues>) => void;
  grossWeightGrams?: string;
  netWeightGrams?: string;
  pureWeightDisplay?: string;
  goldAmountDisplay?: string;
}

function sanitizePurityInput(text: string): string {
  const digits = text.replace(/[^0-9.]/g, '');
  if (!digits) return '';
  const parsed = Number.parseFloat(digits);
  if (!Number.isFinite(parsed)) return '';
  const clamped = Math.min(100, Math.max(0, parsed));
  return `${clamped}%`;
}

function sanitizeChargeAmount(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

function WeightDropdown({
  value,
  onChange,
  disabled,
}: {
  value: LabourWeightBasis;
  onChange: (unit: LabourWeightBasis) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = LABOUR_WEIGHT_OPTIONS.find((opt) => opt.value === value)?.label ??
    LABOUR_WEIGHT_OPTIONS[0].label;

  return (
    <View className="min-w-[140px] flex-1">
      <Pressable
        onPress={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="h-11 flex-row items-center justify-between rounded-input border border-border bg-surface-input px-3"
      >
        <Text className="flex-1 text-xs text-text-primary" numberOfLines={1}>
          {selectedLabel}
        </Text>
        <ChevronDown size={16} color="#757575" />
      </Pressable>
      {open && !disabled ? (
        <View className="absolute left-0 right-0 top-[46px] z-20 overflow-hidden rounded-input border border-border bg-white shadow-md">
          {LABOUR_WEIGHT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`px-3 py-3 ${option.value === value ? 'bg-primary/10' : 'bg-white'}`}
            >
              <Text
                className={`text-xs ${option.value === value ? 'font-semibold text-primary' : 'text-text-primary'}`}
              >
                {option.label}
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
  grossWeightGrams = '',
  netWeightGrams = '',
  pureWeightDisplay = '—',
  goldAmountDisplay = '—',
}: LaborSectionProps) {
  const inferredMethod = values.labourChargeAmount.trim()
    ? 'rate'
    : values.labourPurityPercent.trim()
      ? 'purity'
      : null;
  const [method, setMethod] = useState<'rate' | 'purity'>(inferredMethod ?? 'rate');

  useEffect(() => {
    if (inferredMethod && inferredMethod !== method) {
      setMethod(inferredMethod);
    }
  }, [inferredMethod, method]);

  const grossWt = parseWeightValue(grossWeightGrams);
  const netWt = parseWeightValue(netWeightGrams);
  const selectedWeight = values.labourWeightBasis === 'gross' ? grossWt : netWt;
  const purityPercent = Number.parseFloat(values.labourPurityPercent.replace(/[^0-9.]/g, '')) || 0;
  const newPureWeight = netWt > 0 && purityPercent > 0 ? (netWt * purityPercent) / 100 : 0;
  const newPureWeightDisplay = newPureWeight > 0
    ? `${newPureWeight.toFixed(3).replace(/\.?0+$/, '')} g`
    : '—';

  const computedLaborAmount = useMemo(() => {
    if (method === 'purity') return 0;
    const rate = Number(values.labourChargeAmount) || 0;
    if (rate <= 0 || selectedWeight <= 0) return 0;
    if (values.labourChargeUnit === 'Per 10 Gram') {
      return selectedWeight * (rate / 10);
    }
    return selectedWeight * rate;
  }, [method, selectedWeight, values.labourChargeAmount, values.labourChargeUnit]);

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

  const handleMethodChange = (next: 'rate' | 'purity') => {
    setMethod(next);
    if (next === 'rate') {
      onChange({ labourPurityPercent: '' });
      return;
    }
    onChange({ labourChargeAmount: '' });
  };

  return (
    <FormSection title="Labour Charge">
      <View className="mb-4 rounded-input border border-border bg-white p-3.5">
        <Text className="mb-3 text-xs font-semibold uppercase text-text-muted">
          Calculation Method
        </Text>
        <View className="flex-row gap-4">
          <Pressable
            onPress={() => handleMethodChange('rate')}
            className="flex-row items-center gap-2"
          >
            <View
              className={`h-4 w-4 items-center justify-center rounded-full border ${
                method === 'rate' ? 'border-primary bg-primary' : 'border-border bg-white'
              }`}
            >
              {method === 'rate' ? <View className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </View>
            <Text className="text-sm text-text-primary">Labour Rate</Text>
          </Pressable>

          <Pressable
            onPress={() => handleMethodChange('purity')}
            className="flex-row items-center gap-2"
          >
            <View
              className={`h-4 w-4 items-center justify-center rounded-full border ${
                method === 'purity' ? 'border-primary bg-primary' : 'border-border bg-white'
              }`}
            >
              {method === 'purity' ? <View className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </View>
            <Text className="text-sm text-text-primary">Purity Percentage</Text>
          </Pressable>
        </View>
      </View>

      {method === 'rate' ? (
        <View className="rounded-input border border-border bg-white p-3.5">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 text-xs font-semibold text-text-muted">Labour Rate (₹)</Text>
              <View className="h-11 min-w-0 flex-row items-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="mr-1.5 text-sm font-medium text-text-muted">₹</Text>
                <TextInput
                  value={values.labourChargeAmount}
                  onChangeText={handleChargeChange}
                  placeholder="Enter rate"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="number-pad"
                  className="flex-1 text-sm text-text-primary"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-xs font-semibold text-text-muted">Weight Used</Text>
              <WeightDropdown
                value={values.labourWeightBasis}
                onChange={(labourWeightBasis) => onChange({ labourWeightBasis })}
                disabled={false}
              />
            </View>
          </View>
        </View>
      ) : (
        <View className="rounded-input border border-border bg-white p-3.5">
          <Text className="mb-1 text-xs font-semibold text-text-muted">Purity Percentage</Text>
          <TextInput
            value={values.labourPurityPercent}
            onChangeText={handlePurityChange}
            placeholder="Enter %"
            placeholderTextColor={Colors.placeholder}
            keyboardType="decimal-pad"
            className="h-11 rounded-input border border-border bg-surface-input px-3.5 text-sm text-text-primary"
          />

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs text-text-muted">New Pure Weight</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {purityPercent > 0 ? newPureWeightDisplay : pureWeightDisplay}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-text-muted">New Gold Amount</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {goldAmountDisplay}
            </Text>
          </View>
        </View>
      )}

      <View className="mt-4 rounded-input border border-primary/20 bg-primary/5 px-3.5 py-3">
        <Text className="mb-1 text-xs font-semibold text-text-secondary">Final Labour Amount</Text>
        <Text className="text-lg font-bold text-text-primary">
          {formatInr(computedLaborAmount)}
        </Text>
      </View>
    </FormSection>
  );
}

export function getLaborValuesFromScanData(
  scanData: Pick<
    ScanItemData,
    'labourPurityPercent' | 'labourChargeAmount' | 'labourChargeUnit' | 'labourWeightBasis'
  >,
): LaborSectionValues {
  return {
    labourPurityPercent: scanData.labourPurityPercent || '',
    labourChargeAmount: scanData.labourChargeAmount || '',
    labourChargeUnit: scanData.labourChargeUnit || 'Per Gram',
    labourWeightBasis: scanData.labourWeightBasis || 'gross',
  };
}
