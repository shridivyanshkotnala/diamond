export type LoginMethod = 'email' | 'phone';

export interface RegistrationData {
  businessId: string;
  gstNumber: string;
  businessName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

export interface BusinessLoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
  rememberMe: boolean;
}

export interface OtpState {
  phoneOtp: string;
  emailOtp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface MarketItem {
  id: string;
  title: string;
  changePercent: number;
  basePrice: number;
  totalPrice: number;
}
