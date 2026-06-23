import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MasterNavList } from '@/components/dashboard/masters/MasterNavList';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MASTER_RATES_ITEMS } from '@/constants/settingsMasters';
import { screenStyles } from '@/constants/screenLayout';

export default function MasterRatesScreen() {
  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <PageHeader title="Rates" subtitle="Settings → Masters → Rates" />
      <View style={screenStyles.screenBody}>
        <MasterNavList items={MASTER_RATES_ITEMS} />
      </View>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}
