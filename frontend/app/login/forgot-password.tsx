import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/ui/AuthHeader';
import { FormCard } from '@/components/ui/FormCard';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { TextField } from '@/components/ui/TextField';
import { DUMMY } from '@/constants/dummyData';
import { useAuthStore } from '@/store/authStore';
import { resetPassword } from '@/utils/mockApi';
import { validateEmail, validatePhone } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const loginMethod = useAuthStore((s) => s.loginMethod);
  const setLoginMethod = useAuthStore((s) => s.setLoginMethod);

  const [email, setEmail] = useState(DUMMY.email);
  const [phone, setPhone] = useState(DUMMY.phone);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loginMethod === 'email') {
      const eErr = validateEmail(email);
      setEmailError(eErr);
      setPhoneError(null);
      if (eErr) return;
    } else {
      const pErr = validatePhone(phone);
      setPhoneError(pErr);
      setEmailError(null);
      if (pErr) return;
    }

    setLoading(true);
    try {
      await resetPassword(loginMethod === 'phone' ? phone : email);
      router.push('/login/otp');
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

      <FormCard>
        <TabSwitcher
          tabs={[
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
          ]}
          activeTab={loginMethod}
          onTabChange={(key) => setLoginMethod(key as 'email' | 'phone')}
        />

        <Text className="mb-1 text-xl font-bold text-text-primary">Forgot Password?</Text>
        <Text className="mb-5 text-sm leading-5 text-text-secondary">
          {loginMethod === 'phone'
            ? 'Enter your phone number to reset your password.'
            : 'Enter your email to reset your password.'}
        </Text>

        {loginMethod === 'email' ? (
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
          />
        ) : (
          <PhoneInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            error={phoneError}
          />
        )}

        <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} />
      </FormCard>
    </ScreenContainer>
  );
}
