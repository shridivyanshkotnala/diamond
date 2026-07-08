import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { FormSection } from '@/components/scanner/FormSection';
import { Colors } from '@/constants/theme';

export type CalculationRateMode = 'rtgs' | 'cash';

const RATE_OPTIONS: { value: CalculationRateMode; label: string }[] = [
  { value: 'rtgs', label: 'RTGS Rate' },
  { value: 'cash', label: 'Cash Rate' },
];

interface CalculationRateSectionProps {
  value: CalculationRateMode;
  onChange: (value: CalculationRateMode) => void;
}

export function CalculationRateSection({ value, onChange }: CalculationRateSectionProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = RATE_OPTIONS.find((option) => option.value === value)?.label ?? 'RTGS Rate';

  return (
    <FormSection title="Calculation Rate">
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="h-11 flex-row items-center justify-between rounded-input border border-border bg-surface-input px-3.5"
      >
        <Text className="text-sm text-text-primary">{selectedLabel}</Text>
        <ChevronDown size={18} color={Colors.textMuted} />
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-input border border-border bg-white">
          {RATE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`px-3.5 py-3 ${value === option.value ? 'bg-primary/10' : 'bg-white'}`}
            >
              <Text
                className={`text-sm ${value === option.value ? 'font-semibold text-primary' : 'text-text-primary'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </FormSection>
  );
}
