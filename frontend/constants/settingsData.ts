import type { LucideIcon } from 'lucide-react-native';
import {
  ClipboardCheck,
  Crown,
  FileText,
  IdCard,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Sigma,
  Type,
  UserPlus,
} from 'lucide-react-native';

export interface SettingsMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  isLogout?: boolean;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    id: 'business',
    title: 'Business Details',
    subtitle: 'Manage and Edit your Business Details',
    icon: IdCard,
  },
  {
    id: 'formulae',
    title: 'Manage Formulae',
    subtitle: 'Create, Edit and Delete Formulae',
    icon: Sigma,
  },
  {
    id: 'matrices',
    title: 'Home Dashboard Matrices Control',
    subtitle: 'Control the visibility of Home Screen Matrices',
    icon: LayoutGrid,
  },
  {
    id: 'inventory',
    title: 'Inventory Manager',
    subtitle: 'Manage and Create Inventory',
    icon: ClipboardCheck,
  },
  {
    id: 'employee',
    title: 'Employee Manager',
    subtitle: 'Manage and Add Employees',
    icon: UserPlus,
  },
  {
    id: 'password',
    title: 'Password Manager',
    subtitle: 'Change or Reset Password',
    icon: MoreHorizontal,
  },
  {
    id: 'tunch',
    title: 'Tunch (Purity) Control',
    subtitle: 'Manage and Edit Tunch (Purity)',
    icon: Type,
  },
  {
    id: 'invoice',
    title: 'Invoice Formats',
    subtitle: 'Manage and access Invoice Formats',
    icon: FileText,
  },
  {
    id: 'subscription',
    title: 'Subscription Manager',
    subtitle: 'Manage and access your subscription',
    icon: Crown,
  },
  {
    id: 'logout',
    title: 'Logout Session',
    icon: LogOut,
    isLogout: true,
  },
];
