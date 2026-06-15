import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { ErrorText } from './ErrorText';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(cleaned);
  };

  return (
    <View>
      <Pressable onPress={() => inputRef.current?.focus()} className="flex-row gap-2">
        {digits.map((digit, index) => {
          const isEmpty = !digit.trim();
          const isActive = index === value.length && value.length < OTP_LENGTH;
          return (
            <View
              key={index}
              className={`h-[48px] flex-1 items-center justify-center rounded-lg border ${
                isEmpty && !isActive
                  ? 'border-transparent bg-surface-card'
                  : 'border-text-primary bg-white'
              }`}
            >
              <Text className="text-lg font-semibold text-text-primary">
                {digit.trim() ? digit : ''}
              </Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        className="absolute h-0 w-0 opacity-0"
        autoFocus
      />
      <ErrorText message={error} />
    </View>
  );
}
