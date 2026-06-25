import { Text, View } from 'react-native';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'card';
}

export function FormSection({ title, children, variant = 'default' }: FormSectionProps) {
  const isCard = variant === 'card';

  return (
    <View
      className={
        isCard
          ? 'mb-4 rounded-input border border-border bg-surface-muted px-3.5 pb-1 pt-3.5'
          : 'mb-5'
      }
    >
      <Text
        className={`text-[11px] font-bold uppercase tracking-wider text-text-muted ${
          isCard ? 'mb-2.5' : 'mb-3'
        }`}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
