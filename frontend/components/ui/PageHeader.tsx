import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { screenStyles } from '@/constants/screenLayout';
import { Colors } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, onBack }: PageHeaderProps) {
  const router = useRouter();

  return (
    <View style={screenStyles.pageHeader}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        style={screenStyles.backBtn}
      >
        <ChevronLeft size={24} color={Colors.textPrimary} />
      </Pressable>
      <Text style={screenStyles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={screenStyles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
