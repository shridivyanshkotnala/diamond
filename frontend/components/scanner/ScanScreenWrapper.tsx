import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ScreenBackHeader } from './ScreenBackHeader';
import type { BottomNavRoute } from '@/types/scanner';

interface ScanScreenWrapperProps {
  title: string;
  children: React.ReactNode;
  activeRoute?: BottomNavRoute;
  scanButtonVariant?: 'gold' | 'green';
  footer?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export function ScanScreenWrapper({
  title,
  children,
  activeRoute = 'scanner',
  scanButtonVariant = 'gold',
  footer,
  onBack,
  className = 'bg-white',
}: ScanScreenWrapperProps) {
  return (
    <SafeAreaView className={`flex-1 ${className}`} edges={['top']}>
      <ScreenBackHeader title={title} onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-screen pb-32 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View className="absolute bottom-24 left-0 right-0 px-screen">{footer}</View>
      ) : null}
      <BottomNav activeRoute={activeRoute} scanButtonVariant={scanButtonVariant} />
    </SafeAreaView>
  );
}
