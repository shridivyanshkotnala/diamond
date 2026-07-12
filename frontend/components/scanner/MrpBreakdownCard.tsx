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
  goldAmount: string;
  diamondAmount?: string;
  colorstoneAmount?: string;
  labourAmount: string;
  otherChargesTotal?: string;
  ultimateMrp: string;
}

export function MrpBreakdownCard({
  goldAmount,
  diamondAmount,
  colorstoneAmount,
  labourAmount,
  otherChargesTotal,
  ultimateMrp,
}: MrpBreakdownCardProps) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <BreakdownRow label="Gold Amount" value={goldAmount} />
      {diamondAmount ? <BreakdownRow label="Diamond Amount" value={diamondAmount} /> : null}
      {colorstoneAmount ? (
        <BreakdownRow label="Colorstone Amount" value={colorstoneAmount} />
      ) : null}
      <BreakdownRow label="Labour Amount" value={labourAmount} />
      {otherChargesTotal ? (
        <BreakdownRow label="Other Charges Total" value={otherChargesTotal} />
      ) : null}
      <View className="border-t border-border" />
      <BreakdownRow label="Final MRP" value={ultimateMrp} bold />
    </View>
  );
}
