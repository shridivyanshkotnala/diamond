import { Pressable, Text } from 'react-native';

interface PrimaryGreenButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function PrimaryGreenButton({ title, onPress, icon }: PrimaryGreenButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-2 rounded-button bg-primary py-3.5"
    >
      {icon}
      <Text className="text-sm font-semibold text-white">{title}</Text>
    </Pressable>
  );
}
