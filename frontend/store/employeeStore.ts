import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEMO_EMPLOYEES } from '@/constants/employeeData';
import type { Employee } from '@/types/employee';

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: DEMO_EMPLOYEES,
      addEmployee: (employee) =>
        set((state) => ({
          employees: [employee, ...state.employees],
        })),
      updateEmployee: (id, data) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'pratham-employees',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
