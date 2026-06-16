import { useState } from 'react';
import {
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
import { useRouter, type Href } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { GENDER_OPTIONS } from '@/constants/employeeData';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useEmployeeDraftStore } from '@/store/employeeDraftStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { validateEmail, validatePhone } from '@/utils/validation';

const BUTTON_GREEN = '#1B3022';
const INPUT_BG = '#F4F5F7';

export default function AddEmployeeScreen() {
  const router = useRouter();
  const draft = useEmployeeDraftStore((s) => s.draft);
  const updateDraft = useEmployeeDraftStore((s) => s.updateDraft);
  const mode = useEmployeeDraftStore((s) => s.mode);
  const editEmployeeId = useEmployeeDraftStore((s) => s.editEmployeeId);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);

  const [showGender, setShowGender] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleContinue = () => {
    const nextErrors = {
      fullName: !draft.fullName.trim() ? 'Full name is required' : null,
      phone: validatePhone(draft.phone),
      designation: !draft.designation.trim() ? 'Designation is required' : null,
      email: draft.email.trim() ? validateEmail(draft.email) : null,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (mode === 'edit' && editEmployeeId) {
      updateEmployee(editEmployeeId, {
        fullName: draft.fullName,
        phone: draft.phone,
        email: draft.email,
        gender: draft.gender,
        designation: draft.designation,
      });
      router.back();
      return;
    }

    router.push('/dashboard/employees/permissions' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmployeeScreenHeader title={mode === 'edit' ? 'Edit Employee' : 'Add New Employee'} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>EMPLOYEE DETAILS</Text>

            <Text style={styles.label}>
              FULL NAME<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={draft.fullName}
              onChangeText={(text) => updateDraft({ fullName: text })}
              placeholder="Employee Name"
              placeholderTextColor={Colors.placeholder}
              style={[styles.input, errors.fullName ? styles.inputError : null]}
            />
            {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}

            <Text style={styles.label}>
              PHONE NUMBER<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={draft.phone}
              onChangeText={(text) =>
                updateDraft({ phone: text.replace(/\D/g, '').slice(0, 10) })
              }
              placeholder="+91 9999999999"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              style={[styles.input, errors.phone ? styles.inputError : null]}
            />
            {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              value={draft.email}
              onChangeText={(text) => updateDraft({ email: text })}
              placeholder="employee@pratham.gmail.com"
              placeholderTextColor={Colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, errors.email ? styles.inputError : null]}
            />
            {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

            <Text style={styles.label}>GENDER</Text>
            <Pressable onPress={() => setShowGender((v) => !v)} style={styles.input}>
              <Text style={styles.inputText}>{draft.gender}</Text>
              <ChevronDown size={16} color={Colors.textMuted} />
            </Pressable>
            {showGender ? (
              <View style={styles.dropdown}>
                {GENDER_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      updateDraft({ gender: option });
                      setShowGender(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>
              DESIGNATION<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={draft.designation}
              onChangeText={(text) => updateDraft({ designation: text })}
              placeholder="Sales Manager"
              placeholderTextColor={Colors.placeholder}
              style={[styles.input, errors.designation ? styles.inputError : null]}
            />
            {errors.designation ? <Text style={styles.error}>{errors.designation}</Text> : null}
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={handleContinue} style={styles.continueBtn}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav activeRoute="home" />
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
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  required: {
    color: Colors.dangerText,
  },
  input: {
    minHeight: 48,
    backgroundColor: INPUT_BG,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.dangerText,
  },
  error: {
    fontSize: 12,
    color: Colors.dangerText,
    marginTop: 6,
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  continueBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
