import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AuthHeader } from '@/components/ui/AuthHeader';
import { FormCard } from '@/components/ui/FormCard';
import { OtpInput } from '@/components/ui/OtpInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { DUMMY } from '@/constants/dummyData';
import { useAuthStore } from '@/store/authStore';
import { sendOtp, verifyOtp } from '@/utils/mockApi';
import { maskPhone, validateOtp } from '@/utils/validation';

export default function LoginVerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; email?: string }>();
  const phone = params.phone ?? DUMMY.phone;
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const [otp, setOtp] = useState(DUMMY.otp);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    const error = validateOtp(otp);
    setOtpError(error);
    if (error) return;

    setLoading(true);
    try {
      const result = await verifyOtp(otp);
      if (result.success) {
        setAuthenticated(true);
        router.replace('/dashboard');
      } else {
        setOtpError(result.error ?? 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await sendOtp(phone, 'phone');
      setOtp('');
      setOtpError(null);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <AuthHeader
        title="Login as a Business"
        subtitle="Don't have an account?"
        linkText="Sign Up"
        onLinkPress={() => router.replace('/register/gst')}
      />

      <FormCard title="OTP Verification">
        <Text className="mb-4 text-sm leading-5 text-text-label">
          Enter the verification code sent to {maskPhone(phone)}.
        </Text>

        <OtpInput value={otp} onChange={setOtp} error={otpError} />

        <Pressable onPress={handleResend} disabled={resendLoading} className="mt-3 self-end">
          <Text className="text-sm text-text-primary">
            Didn&apos;t receive code?{' '}
            <Text className="font-medium text-accent underline">
              {resendLoading ? 'Sending...' : 'Resend'}
            </Text>
          </Text>
        </Pressable>

        <PrimaryButton title="Verify OTP" onPress={handleVerify} loading={loading} style={{ marginTop: 24 }} />
      </FormCard>
    </ScreenContainer>
  );
}
