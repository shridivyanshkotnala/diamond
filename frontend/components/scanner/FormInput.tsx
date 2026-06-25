import { TextInput, View } from 'react-native';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { Colors } from '@/constants/theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  required = false,
  containerClassName = 'mb-3',
}: FormInputProps) {
  return (
    <View className={containerClassName}>
      <FieldLabel label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        placeholderTextColor={Colors.placeholder}
        className="h-11 rounded-input border border-border bg-surface-input px-3.5 text-sm text-text-primary"
      />
    </View>
  );
}
