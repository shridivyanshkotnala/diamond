import { Text, View } from 'react-native';

interface BreakdownRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

function BreakdownRow({ label, value, bold = false }: BreakdownRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        bold ? '' : 'border-b border-border'
      }`}
    >
      <Text className={`text-sm ${bold ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
        {label}
      </Text>
      <Text className={`text-sm ${bold ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
        {value}
      </Text>
    </View>
  );
}

interface MrpBreakdownCardProps {
  goldBase: string;
  stoneTotal: string;
  labour: string;
  ultimateMrp: string;
}

export function MrpBreakdownCard({
  goldBase,
  stoneTotal,
  labour,
  ultimateMrp,
}: MrpBreakdownCardProps) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <BreakdownRow label="Gold Base Price" value={goldBase} />
      <BreakdownRow label="Stone Total" value={stoneTotal} />
      <BreakdownRow label="Labour" value={labour} />
      <BreakdownRow label="Ultimate MRP" value={ultimateMrp} bold />
    </View>
  );
}
