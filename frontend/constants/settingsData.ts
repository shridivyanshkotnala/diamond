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
  TrendingUp,
  Type,
  UserPlus,
} from 'lucide-react-native';

export interface SettingsMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  route?: string;
  isLogout?: boolean;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    id: 'matrices',
    title: 'Dashboard Settings',
    icon: LayoutGrid,
    route: '/dashboard/dashboard-matrices',
  },
  {
    id: 'masters',
    title: 'Masters',
    icon: TrendingUp,
    route: '/dashboard/masters',
  },
  {
    id: 'rate-control',
    title: 'Rate Control Panel',
    icon: Sigma,
    route: '/dashboard/rate-control',
  },
  {
    id: 'employee',
    title: 'Employee Manager',
    icon: UserPlus,
    route: '/dashboard/employees',
  },
  {
    id: 'password',
    title: 'Password Manager',
    icon: MoreHorizontal,
    route: '/dashboard/password-manager',
  },
  {
    id: 'subscription',
    title: 'Subscription Manager',
    icon: Crown,
    route: '/dashboard/subscription-manager',
  },
  {
    id: 'logout',
    title: 'Logout Session',
    icon: LogOut,
    isLogout: true,
  },
];
