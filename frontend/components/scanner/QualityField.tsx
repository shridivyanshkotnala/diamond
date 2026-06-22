import { Text, View } from 'react-native';

import { FormInput } from '@/components/scanner/FormInput';

interface QualityFieldProps {
  label: string;
  value: string;
}

export function QualityField({ label, value }: QualityFieldProps) {
  return (
    <View className="w-[48%]">
      <FormInput label={label} value={value} editable={false} placeholder="Auto-generated" />
    </View>
  );
}
