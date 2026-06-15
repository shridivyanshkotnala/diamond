import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginMethod, RegistrationData } from '@/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  rememberMe: boolean;
  loginMethod: LoginMethod;
  savedEmail: string;
  savedPhone: string;
  registration: Partial<RegistrationData>;
  setAuthenticated: (value: boolean) => void;
  setAuthToken: (token: string | null) => void;
  setRememberMe: (value: boolean) => void;
  setLoginMethod: (method: LoginMethod) => void;
  setSavedCredentials: (email: string, phone: string) => void;
  updateRegistration: (data: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authToken: null,
      rememberMe: false,
      loginMethod: 'email',
      savedEmail: '',
      savedPhone: '',
      registration: {},
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setAuthToken: (token) => set({ authToken: token }),
      setRememberMe: (value) => set({ rememberMe: value }),
      setLoginMethod: (method) => set({ loginMethod: method }),
      setSavedCredentials: (email, phone) => set({ savedEmail: email, savedPhone: phone }),
      updateRegistration: (data) =>
        set((state) => ({ registration: { ...state.registration, ...data } })),
      resetRegistration: () => set({ registration: {} }),
      logout: () => set({ isAuthenticated: false, authToken: null }),
    }),
    {
      name: 'pratham-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        savedEmail: state.savedEmail,
        savedPhone: state.savedPhone,
        loginMethod: state.loginMethod,
      }),
    }
  )
);
