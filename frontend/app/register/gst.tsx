import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { DUMMY } from '@/constants/dummyData';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { verifyGst } from '@/utils/mockApi';
import { validateGst } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const CONFIRM_GREEN = '#1E2F28';
const BUSINESS_BOX_BG = '#F4F5F7';

export default function GstVerificationScreen() {
  const router = useRouter();
  const updateRegistration = useAuthStore((s) => s.updateRegistration);

  const [gstNumber, setGstNumber] = useState(DUMMY.gstNumber);
  const [businessName, setBusinessName] = useState(DUMMY.businessName);
  const [isVerified, setIsVerified] = useState(true);
  const [gstError, setGstError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleVerify = async () => {
    const error = validateGst(gstNumber);
    setGstError(error);
    if (error) return;

    setVerifyLoading(true);
    try {
      const result = await verifyGst(gstNumber);
      if (result.success && result.businessName) {
        setBusinessName(result.businessName);
        setIsVerified(true);
        setGstError(null);
      } else {
        setGstError(result.error ?? 'Verification failed');
        setIsVerified(false);
        setBusinessName('');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isVerified || !businessName) {
      setGstError('Please verify GST number first');
      return;
    }

    setConfirmLoading(true);
    try {
      updateRegistration({ gstNumber: gstNumber.trim().toUpperCase(), businessName });
      router.push('/register/contact');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <BackgroundPattern />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
            </Pressable>

            <Text style={styles.headerTitle}>Register as Buisness</Text>

            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>Already have an account? </Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={styles.headerLink}>Log In</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardScroll}
            >
              <Text style={styles.cardTitle}>GST Verification</Text>
              <Text style={styles.cardDescription}>
                Enter GST Number to verify buisness details.
              </Text>

              <Text style={styles.inputLabel}>GST Number</Text>

              <View style={[styles.inputRow, gstError ? styles.inputRowError : null]}>
                <TextInput
                  value={gstNumber}
                  onChangeText={(text) => {
                    setGstNumber(text.toUpperCase());
                    setIsVerified(false);
                    setBusinessName('');
                    setGstError(null);
                  }}
                  placeholder="GSTNXXXXXXXXXXXX"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  editable={!verifyLoading}
                  style={styles.textInput}
                />

                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={verifyLoading}
                  activeOpacity={0.9}
                  style={[styles.verifyBtn, verifyLoading && styles.verifyBtnDisabled]}
                >
                  {verifyLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>

              {gstError ? <Text style={styles.errorText}>{gstError}</Text> : null}

              {isVerified && businessName ? (
                <View style={styles.businessNameBox}>
                  <Text style={styles.businessNameText} numberOfLines={2}>
                    {businessName}
                  </Text>
                </View>
              ) : null}

              {isVerified && businessName ? (
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={confirmLoading}
                  activeOpacity={0.9}
                  style={[styles.confirmBtn, confirmLoading && styles.confirmBtnDisabled]}
                >
                  {confirmLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerLink: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT_TAN,
    textDecorationLine: 'underline',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardScroll: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: 28,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingLeft: 16,
    paddingRight: 4,
  },
  inputRowError: {
    borderColor: Colors.dangerText,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  verifyBtn: {
    height: 40,
    minWidth: 76,
    backgroundColor: ACCENT_TAN,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  businessNameBox: {
    minHeight: Spacing.inputHeight,
    justifyContent: 'center',
    backgroundColor: BUSINESS_BOX_BG,
    borderRadius: Radius.input,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  businessNameText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: CONFIRM_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
