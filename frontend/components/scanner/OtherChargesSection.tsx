import { Text, TextInput, View } from 'react-native';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormSection } from '@/components/scanner/FormSection';
import { Colors } from '@/constants/theme';

interface OtherChargesSectionProps {
  amount: string;
  remarks: string;
  onAmountChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  showRemarksError?: boolean;
}

function sanitizeAmountInput(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

export function OtherChargesSection({
  amount,
  remarks,
  onAmountChange,
  onRemarksChange,
  showRemarksError = false,
}: OtherChargesSectionProps) {
  const numericAmount = Number.parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  const hasAmount = numericAmount > 0;

  return (
    <FormSection title="Other Charges">
      <View className="mb-3">
        <FieldLabel label="Other Charges (₹)" />
        <View className="h-11 flex-row items-center rounded-input border border-border bg-surface-input px-3.5">
          <Text className="mr-1.5 text-sm font-medium text-text-muted">₹</Text>
          <TextInput
            value={amount}
            onChangeText={(text) => onAmountChange(sanitizeAmountInput(text))}
            placeholder="Enter amount"
            placeholderTextColor={Colors.placeholder}
            keyboardType="number-pad"
            className="flex-1 text-sm text-text-primary"
          />
        </View>
      </View>

      {hasAmount ? (
        <View>
          <FieldLabel label="Remarks" required />
          <TextInput
            value={remarks}
            onChangeText={onRemarksChange}
            placeholder="Add remarks"
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlignVertical="top"
            className={`min-h-[96px] rounded-input border bg-surface-input px-3.5 py-3 text-sm text-text-primary ${
              showRemarksError ? 'border-danger-text' : 'border-border'
            }`}
          />
          {showRemarksError ? (
            <Text className="mt-2 text-xs text-danger-text">
              Remarks are required when other charges are added.
            </Text>
          ) : null}
        </View>
      ) : null}
    </FormSection>
  );
}
