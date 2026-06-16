import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_MATRIX_VALUES,
  type MatrixKey,
} from '@/constants/dashboardMatrices';

interface MatricesState {
  values: Record<MatrixKey, boolean>;
  toggle: (key: MatrixKey) => void;
  setValue: (key: MatrixKey, value: boolean) => void;
  applyValues: (values: Record<MatrixKey, boolean>) => void;
}

export const useMatricesStore = create<MatricesState>()(
  persist(
    (set) => ({
      values: { ...DEFAULT_MATRIX_VALUES },
      toggle: (key) =>
        set((state) => ({
          values: { ...state.values, [key]: !state.values[key] },
        })),
      setValue: (key, value) =>
        set((state) => ({
          values: { ...state.values, [key]: value },
        })),
      applyValues: (values) => set({ values }),
    }),
    {
      name: 'pratham-dashboard-matrices',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
