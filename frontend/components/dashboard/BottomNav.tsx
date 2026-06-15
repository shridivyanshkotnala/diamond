import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Home, ScanLine, Sparkles } from 'lucide-react-native';

import type { BottomNavRoute } from '@/types/scanner';

const ACCENT_GOLD = '#D4C19C';
const NAV_GREEN = '#1E332E';

interface BottomNavProps {
  activeRoute?: BottomNavRoute;
  scanButtonVariant?: 'gold' | 'green';
}

export function BottomNav({ activeRoute = 'home', scanButtonVariant = 'gold' }: BottomNavProps) {
  const router = useRouter();

  const scanBtnColor =
    activeRoute === 'scanner' && scanButtonVariant === 'gold' ? ACCENT_GOLD : NAV_GREEN;

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
      <View className="flex-row items-end justify-between rounded-[28px] bg-white px-8 pb-3 pt-4 shadow-lg">
        <Pressable
          className="min-w-[64px] items-center"
          onPress={() => router.push('/dashboard')}
        >
          <Home
            size={22}
            color={activeRoute === 'home' ? ACCENT_GOLD : NAV_GREEN}
            fill={activeRoute === 'home' ? ACCENT_GOLD : 'transparent'}
          />
          <Text
            className={`mt-1 text-xs font-medium ${
              activeRoute === 'home' ? 'text-accent-gold' : 'text-text-muted'
            }`}
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          className="-mt-8 h-14 w-14 items-center justify-center rounded-full shadow-md"
          style={{ backgroundColor: scanBtnColor }}
          onPress={() => router.push('/dashboard/scanner' as Href)}
        >
          <ScanLine size={24} color="#FFFFFF" />
        </Pressable>

        <Pressable className="min-w-[64px] items-center">
          <Sparkles size={22} color={NAV_GREEN} />
          <Text className="mt-1 text-xs font-medium text-text-muted">Pratham AI</Text>
        </Pressable>
      </View>
    </View>
  );
}
