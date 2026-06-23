import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface ScreenBackHeaderProps {
  title?: string;
  onBack?: () => void;
  light?: boolean;
  iconColor?: string;
}

export function ScreenBackHeader({ title, onBack, light = false, iconColor }: ScreenBackHeaderProps) {
  const router = useRouter();
  const arrowColor = iconColor ?? (light ? '#FFFFFF' : '#000000');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={`px-screen pt-2 ${title ? 'pb-3' : ''}`}>
      <Pressable onPress={handleBack} hitSlop={12} className="h-10 w-10 items-center justify-center">
        <ArrowLeft size={24} color={arrowColor} />
      </Pressable>
      {title ? (
        <Text className="mt-2 text-[28px] font-bold leading-[34px] text-text-primary">{title}</Text>
      ) : null}
    </View>
  );
}
