import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MasterNavList } from '@/components/dashboard/masters/MasterNavList';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MASTER_SECTION_ITEMS } from '@/constants/settingsMasters';
import { screenStyles } from '@/constants/screenLayout';

export default function MastersScreen() {
  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <PageHeader title="Masters" subtitle="Settings → Masters" />
      <View style={screenStyles.screenBody}>
        <MasterNavList items={MASTER_SECTION_ITEMS} />
      </View>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}
