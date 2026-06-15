import { Text, TextInput, View } from 'react-native';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
}: FormInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-label">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        placeholderTextColor="#8E8E8E"
        className="rounded-input border border-border bg-[#F4F5F7] px-4 py-3.5 text-base text-text-primary"
      />
    </View>
  );
}
