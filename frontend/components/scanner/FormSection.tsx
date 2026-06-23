import { Text, View } from 'react-native';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}
