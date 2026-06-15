import { Pressable, ScrollView, Text, View } from 'react-native';

import { JEWELLERY_TYPES } from '@/constants/scannerData';
import { useScannerStore } from '@/store/scannerStore';
import type { JewelleryType } from '@/types/scanner';

interface JewelleryTypeChipsProps {
  variant?: 'scanner' | 'form';
}

export function JewelleryTypeChips({ variant = 'scanner' }: JewelleryTypeChipsProps) {
  const selectedType = useScannerStore((s) => s.selectedType);
  const setSelectedType = useScannerStore((s) => s.setSelectedType);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-1"
    >
      {JEWELLERY_TYPES.map((type) => {
        const isActive = selectedType === type;
        return (
          <Pressable
            key={type}
            onPress={() => setSelectedType(type as JewelleryType)}
            className={`rounded-full border px-4 py-2 ${
              isActive
                ? 'border-accent-gold bg-accent-gold'
                : 'border-border bg-white'
            } ${variant === 'form' ? 'px-5 py-2.5' : ''}`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {type}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
