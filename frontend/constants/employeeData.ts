import { DEFAULT_MATRIX_VALUES } from '@/constants/dashboardMatrices';
import type { Employee, EmployeePermissions } from '@/types/employee';

export const DEFAULT_EMPLOYEE_PERMISSIONS: EmployeePermissions = {
  ...DEFAULT_MATRIX_VALUES,
  upload_new_items: true,
  delete_stock_items: false,
  edit_formulae: false,
  revoke_access: false,
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP-INT-001',
    fullName: 'Rahul Verma',
    designation: 'Senior Salesman',
    phone: '9999999999',
    email: 'rahul.pratham.int@gmail.com',
    gender: 'Male',
    password: 'Rahul@Pratham451',
    permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS },
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-INT-002',
    fullName: 'Aakash Singh',
    designation: 'Junior Salesman',
    phone: '9876543210',
    email: 'aakash.pratham.int@gmail.com',
    gender: 'Male',
    password: 'Aakash@Pratham451',
    permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS },
  },
  {
    id: 'emp-3',
    employeeId: 'EMP-INT-003',
    fullName: 'Priya Sharma',
    designation: 'Inventory Manager',
    phone: '9123456780',
    email: 'priya.pratham.int@gmail.com',
    gender: 'Female',
    password: 'Priya@Pratham451',
    permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS },
  },
  {
    id: 'emp-4',
    employeeId: 'EMP-INT-004',
    fullName: 'Keshav Raathi',
    designation: 'Inventory Manager',
    phone: '9988776655',
    email: 'keshav.pratham.int@gmail.com',
    gender: 'Male',
    password: 'Keshav@Pratham451',
    permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS },
  },
];

export function getNextEmployeeId(count: number) {
  return `EMP-INT-${String(count + 1).padStart(3, '0')}`;
}
