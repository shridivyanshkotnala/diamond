import { SafeAreaView } from 'react-native-safe-area-context';

import { MasterFormulasModule } from '@/components/dashboard/masters/MasterFormulaConfig';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { screenStyles } from '@/constants/screenLayout';

export default function MasterFormulasScreen() {
  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <PageHeader title="Formulas" subtitle="Settings → Masters → Formulas" />
      <MasterFormulasModule />
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}
