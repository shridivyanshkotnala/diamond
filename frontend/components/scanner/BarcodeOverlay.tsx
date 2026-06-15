import { View } from 'react-native';

import { SCANNER_FRAME_HEIGHT, SCANNER_FRAME_WIDTH } from './ScannerScreenLayout';

export function BarcodeOverlay() {
  return (
    <View
      style={{ width: SCANNER_FRAME_WIDTH, height: SCANNER_FRAME_HEIGHT }}
      className="relative overflow-hidden rounded-xl border border-white/40 bg-black/20"
    >
      <View
        className="absolute left-0 right-0 bg-red-500"
        style={{ top: '50%', height: 2, marginTop: -1 }}
      />
    </View>
  );
}
