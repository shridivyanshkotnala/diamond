import { Pressable, Text } from 'react-native';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function OutlineButton({ title, onPress, icon }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-2 rounded-button border border-primary py-3.5"
    >
      {icon}
      <Text className="text-sm font-semibold text-primary">{title}</Text>
    </Pressable>
  );
}
