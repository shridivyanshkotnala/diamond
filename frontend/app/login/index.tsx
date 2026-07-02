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
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { loginBusiness } from '@/utils/authApi';
import { validateEmail, validatePassword } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';

export default function BusinessLoginScreen() {
  const router = useRouter();
  const {
    rememberMe,
    setRememberMe,
    savedEmail,
    savedPhone,
    registration,
    setAuthenticated,
    setAuthToken,
    setRefreshToken,
    setSavedCredentials,
    setUserRole,
    setLoggedInEmployee,
  } = useAuthStore();

  const [email, setEmail] = useState(savedEmail || registration.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setFormError(null);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      const result = await loginBusiness(email, password);
      if (result.success && result.data) {
        setAuthToken(result.data.accessToken);
        if (result.data.refreshToken) {
          setRefreshToken(result.data.refreshToken);
        }
        setUserRole('business');
        setLoggedInEmployee(null);
        setAuthenticated(true);
        
        const { updateRegistration } = useAuthStore.getState();
        updateRegistration({
          businessName: result.data.businessName || '',
          gstNumber: result.data.gstNumber || '',
          businessType: result.data.businessType || '',
          address: result.data.address || '',
          phone: result.data.phone || '',
          email: result.data.email || '',
        });

        if (rememberMe) {
          setSavedCredentials(email.trim().toLowerCase(), savedPhone);
        }
        router.replace('/dashboard');
      } else {
        setFormError(result.error ?? 'Login failed. Check your email and password.');
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

            <Text style={styles.headerTitle}>Login as a Business</Text>

            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => router.replace('/register/gst')}>
                <Text style={styles.headerLink}>Register</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardScroll}
            >
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputRow, emailError ? styles.inputError : null]}>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(null);
                  }}
                  placeholder="you@business.com"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <Text style={[styles.inputLabel, styles.passwordLabel]}>Password</Text>
              <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(null);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
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
                  <Text style={styles.forgotLink}>Forgot password?</Text>
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
    fontSize: 42,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 45,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerLink: {
    fontSize: 12,
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
    paddingBottom: 20,
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
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
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
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
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
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '500',
    color: ACCENT_TAN,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
