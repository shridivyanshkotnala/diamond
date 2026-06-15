import { useState } from 'react';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/ui/AuthHeader';
import { FormCard } from '@/components/ui/FormCard';
import { OrSeparator } from '@/components/ui/OrSeparator';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { DUMMY } from '@/constants/dummyData';
import { sendOtp } from '@/utils/mockApi';
import { validatePhone } from '@/utils/validation';

export default function LoginOtpScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState(DUMMY.phone);
  const [email, setEmail] = useState(DUMMY.email);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const pErr = validatePhone(phone);
    setPhoneError(pErr);
    if (pErr) return;

    setLoading(true);
    try {
      await sendOtp(phone, 'phone');
      router.push({
        pathname: '/login/verify-otp',
        params: { phone, email },
      });
    } finally {
      setLoading(false);
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

      <FormCard
        title="Enter Contact Details"
        description="Enter your phone number and email to login using OTP."
      >
        <PhoneInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          error={phoneError}
        />

        <OrSeparator />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} />
      </FormCard>
    </ScreenContainer>
  );
}
