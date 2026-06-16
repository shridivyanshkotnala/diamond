import type { MatrixKey } from '@/constants/dashboardMatrices';

export type EmployeeGender = 'Male' | 'Female' | 'Other';

export type ExtraPermissionKey =
  | 'upload_new_items'
  | 'delete_stock_items'
  | 'edit_formulae'
  | 'revoke_access';

export type EmployeePermissionKey = MatrixKey | ExtraPermissionKey;

export type EmployeePermissions = Record<EmployeePermissionKey, boolean>;

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  gender: EmployeeGender;
  password: string;
  permissions: EmployeePermissions;
}

export interface EmployeeDraft {
  fullName: string;
  phone: string;
  email: string;
  gender: EmployeeGender;
  designation: string;
  permissions: EmployeePermissions;
  password: string;
  confirmPassword: string;
}
