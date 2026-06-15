import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

interface ReviewFieldRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  missing?: boolean;
}

function ReviewFieldRow({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  missing = false,
}: ReviewFieldRowProps) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <Text className="w-[118px] text-sm font-semibold text-text-primary">
        {label}
        {required ? <Text className="text-danger-text">*</Text> : null}
      </Text>
      <View
        className={`h-[42px] flex-1 flex-row items-center rounded-input border bg-white px-3 ${
          missing ? 'border-danger-text' : 'border-border'
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B0B0B0"
          className="flex-1 text-sm text-text-primary"
        />
        {!missing ? <Pencil size={14} color="#757575" /> : null}
      </View>
    </View>
  );
}

interface ReviewScannedResultsModalProps {
  grossWt: string;
  netWt: string;
  tunch: string;
  diamondWeight: string;
  diamondPieces: string;
  diamondRate: string;
  diamondQuality: string;
  labour: string;
  onGrossWtChange: (value: string) => void;
  onNetWtChange: (value: string) => void;
  onTunchChange: (value: string) => void;
  onDiamondWeightChange: (value: string) => void;
  onDiamondPiecesChange: (value: string) => void;
  onDiamondRateChange: (value: string) => void;
  onDiamondQualityChange: (value: string) => void;
  onLabourChange: (value: string) => void;
  onReScan: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

export function ReviewScannedResultsModal({
  grossWt,
  netWt,
  tunch,
  diamondWeight,
  diamondPieces,
  diamondRate,
  diamondQuality,
  labour,
  onGrossWtChange,
  onNetWtChange,
  onTunchChange,
  onDiamondWeightChange,
  onDiamondPiecesChange,
  onDiamondRateChange,
  onDiamondQualityChange,
  onLabourChange,
  onReScan,
  onConfirm,
  confirming = false,
}: ReviewScannedResultsModalProps) {
  return (
    <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
      <Text className="mb-5 text-lg font-bold text-text-primary">Review Scanned Results</Text>

      <ReviewFieldRow
        label="Gross Wt."
        value={grossWt}
        onChangeText={onGrossWtChange}
        placeholder="Enter Missing Value"
        required
        missing={!grossWt}
      />
      <ReviewFieldRow label="Net Weight" value={netWt} onChangeText={onNetWtChange} />
      <ReviewFieldRow label="Tunch (Purity)" value={tunch} onChangeText={onTunchChange} />
      <ReviewFieldRow label="Diamond Wt." value={diamondWeight} onChangeText={onDiamondWeightChange} />
      <ReviewFieldRow
        label="Diamond Pieces"
        value={diamondPieces}
        onChangeText={onDiamondPiecesChange}
      />
      <ReviewFieldRow label="Diamond Rate" value={diamondRate} onChangeText={onDiamondRateChange} />
      <ReviewFieldRow
        label="Diamond Quality"
        value={diamondQuality}
        onChangeText={onDiamondQualityChange}
      />
      <ReviewFieldRow label="Labour" value={labour} onChangeText={onLabourChange} />

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={onReScan}
          className="flex-1 items-center rounded-button border border-border bg-white py-3.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-text-secondary">ReScan</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={confirming}
          className="flex-1 items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
        >
          {confirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-semibold text-white">Confirm</Text>
          )}
        </Pressable>
      </View>

      <Text className="mt-4 text-center text-xs leading-5 text-text-secondary">
        <Text className="text-danger-text">*</Text> Scanner couldn't scan or find specific value,
        Manually Enter value or ReScan.
      </Text>
    </View>
  );
}
