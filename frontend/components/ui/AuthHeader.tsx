import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Colors } from '@/constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  onLinkPress?: () => void;
  showBack?: boolean;
}

export function AuthHeader({
  title,
  subtitle,
  linkText,
  onLinkPress,
  showBack = true,
}: AuthHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-5 pt-2">
      {showBack && (
        <Pressable onPress={() => router.back()} className="mb-3 h-8 w-8 justify-center" hitSlop={8}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
      )}
      <Text className="text-[26px] font-bold leading-8 text-text-primary">{title}</Text>
      {subtitle && (
        <View className="mt-1.5 flex-row flex-wrap items-center">
          <Text className="shrink text-sm text-text-primary">{subtitle} </Text>
          {linkText && onLinkPress && (
            <Pressable onPress={onLinkPress}>
              <Text className="text-sm font-medium text-accent underline">{linkText}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
