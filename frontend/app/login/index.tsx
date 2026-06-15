import { useEffect, useState } from 'react';
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
import { ChevronDown, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { DUMMY } from '@/constants/dummyData';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { loginWithCredentials } from '@/utils/mockApi';
import { validateEmail, validatePassword, validatePhone } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';
const TAB_BG = '#F2F2F7';

export default function LoginScreen() {
  const router = useRouter();
  const {
    loginMethod,
    setLoginMethod,
    rememberMe,
    setRememberMe,
    savedEmail,
    savedPhone,
    setSavedCredentials,
    setAuthenticated,
  } = useAuthStore();

  const [email, setEmail] = useState(savedEmail || DUMMY.email);
  const [phone, setPhone] = useState(savedPhone || DUMMY.phone);
  const [password, setPassword] = useState(DUMMY.password);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (savedEmail) setEmail(savedEmail);
    if (savedPhone) setPhone(savedPhone);
  }, [savedEmail, savedPhone]);

  const handleLogin = async () => {
    setFormError(null);
    const pErr = validatePassword(password);
    setPasswordError(pErr);

    let identifier = '';
    if (loginMethod === 'email') {
      const eErr = validateEmail(email);
      setEmailError(eErr);
      setPhoneError(null);
      if (eErr || pErr) return;
      identifier = email.trim();
    } else {
      const phErr = validatePhone(phone);
      setPhoneError(phErr);
      setEmailError(null);
      if (phErr || pErr) return;
      identifier = phone;
    }

    setLoading(true);
    try {
      const result = await loginWithCredentials(identifier, password, loginMethod);
      if (result.success) {
        if (rememberMe) {
          setSavedCredentials(
            loginMethod === 'email' ? email.trim() : savedEmail,
            loginMethod === 'phone' ? phone : savedPhone
          );
        }
        setAuthenticated(true);
        router.replace('/dashboard');
      } else {
        setFormError(result.error ?? 'Login failed');
      }
    } finally {
      setLoading(false);
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

            <Text style={styles.headerTitle}>Login as a Buisness</Text>

            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => router.replace('/register/gst')}>
                <Text style={styles.headerLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardScroll}
            >
              <View style={styles.tabRow}>
                <Pressable
                  onPress={() => setLoginMethod('email')}
                  style={[styles.tab, loginMethod === 'email' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, loginMethod === 'email' && styles.tabTextActive]}>
                    Use Email
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setLoginMethod('phone')}
                  style={[styles.tab, loginMethod === 'phone' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, loginMethod === 'phone' && styles.tabTextActive]}>
                    Use Phone Number
                  </Text>
                </Pressable>
              </View>

              {loginMethod === 'email' ? (
                <>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={[styles.inputRow, emailError ? styles.inputError : null]}>
                    <TextInput
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setEmailError(null);
                      }}
                      placeholder="Loisbecket@gmail.com"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.textInput}
                    />
                  </View>
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={[styles.phoneRow, phoneError ? styles.inputError : null]}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                      <ChevronDown size={14} color={Colors.textMuted} />
                    </View>
                    <TextInput
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text.replace(/\D/g, '').slice(0, 10));
                        setPhoneError(null);
                      }}
                      placeholder="9999999999"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="phone-pad"
                      style={styles.phoneInput}
                    />
                  </View>
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </>
              )}

              <Text style={[styles.inputLabel, styles.passwordLabel]}>Password</Text>
              <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <Eye size={20} color={Colors.textMuted} />
                  ) : (
                    <EyeOff size={20} color={Colors.textMuted} />
                  )}
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <View style={styles.optionsRow}>
                <Pressable
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.checkboxRow}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </Pressable>

                <Pressable onPress={() => router.push('/login/forgot-password')}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </Pressable>
              </View>

              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </TouchableOpacity>

              <Pressable onPress={() => router.push('/login/otp')} style={styles.vendorLinkWrap}>
                <Text style={styles.vendorLink}>Login as a Vendor using OTP</Text>
              </Pressable>
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
    backgroundColor: Colors.white,
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: TAB_BG,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  inputError: {
    borderColor: Colors.dangerText,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: BUTTON_GREEN,
    backgroundColor: BUTTON_GREEN,
  },
  checkmark: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  forgotLink: {
    fontSize: 14,
    color: ACCENT_TAN,
  },
  loginBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  vendorLinkWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  vendorLink: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT_TAN,
    textAlign: 'center',
  },
});
