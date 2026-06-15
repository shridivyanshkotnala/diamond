import { DUMMY } from '@/constants/dummyData';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_MIN_LENGTH = 8;

export function validateGst(gst: string): string | null {
  const trimmed = gst.trim().toUpperCase();
  if (!trimmed) return 'GST number is required';
  if (trimmed === DUMMY.gstNumber.toUpperCase()) return null;
  const withoutPrefix = trimmed.replace(/^GSTN/, '');
  if (GST_REGEX.test(withoutPrefix) || GST_REGEX.test(trimmed)) return null;
  return 'Enter a valid GST number';
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 'Phone number is required';
  if (!PHONE_REGEX.test(digits)) return 'Enter a valid 10-digit phone number';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!otp) return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) return 'Enter the 6-digit OTP';
  return null;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 4) return phone;
  return `+91 ${digits.slice(0, 2)} ******${digits.slice(-2)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 4).toLowerCase();
  return `${visible}***@${domain}`;
}
