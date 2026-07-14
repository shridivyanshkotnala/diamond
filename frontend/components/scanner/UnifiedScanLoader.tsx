import { ActivityIndicator, Text, View } from 'react-native';

import { ScanStage } from '@/types/scanner';

type UnifiedScanLoaderProps = {
  progress: number;
  stage: ScanStage;
};

function stageMessage(stage: ScanStage): string {
  if (stage === ScanStage.Uploading) return 'Uploading Tags...';
  if (stage === ScanStage.AIProcessing) return 'Processing Tag Details...';
  if (stage === ScanStage.PreparingResults) return 'Loading Scanned Results...';
  return 'Finalizing...';
}

export function UnifiedScanLoader({ progress, stage }: UnifiedScanLoaderProps) {
  const percent = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <View className="items-center px-8">
      <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/40 bg-accent-gold/10">
        <ActivityIndicator size="large" color="#D4C19C" />
      </View>

      <Text className="text-5xl font-bold text-white">{percent}%</Text>

      <Text className="mt-5 text-center text-lg font-semibold text-white">{stageMessage(stage)}</Text>
      <Text className="mt-3 text-center text-sm text-white/75">
        Please wait while the jewellery tag is being analysed.
      </Text>
    </View>
  );
}
