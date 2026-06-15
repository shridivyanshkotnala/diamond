import { Text, View } from 'react-native';

interface PriceCardProps {
  label: string;
  amount: string;
  subtitle: string;
}

export function PriceCard({ label, amount, subtitle }: PriceCardProps) {
  return (
    <View className="mb-4 items-center rounded-2xl bg-primary px-5 py-6">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </Text>
      <Text className="mt-2 text-[34px] font-bold text-white">{amount}</Text>
      <Text className="mt-1 text-sm text-white/60">{subtitle}</Text>
    </View>
  );
}
