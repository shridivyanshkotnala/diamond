import { BUSINESS_PROFILE_VIEW, DUMMY } from '@/constants/dummyData';
import type { RegistrationData } from '@/types/auth';

export interface BusinessProfile {
  businessName: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
}

export function getBusinessProfile(registration: Partial<RegistrationData>): BusinessProfile {
  return {
    businessName: registration.businessName ?? DUMMY.businessName,
    gstNumber: registration.gstNumber ?? BUSINESS_PROFILE_VIEW.gstNumber,
    phone: registration.phone ?? DUMMY.phone,
    email: registration.email ?? BUSINESS_PROFILE_VIEW.email,
    address: registration.address ?? DUMMY.address,
  };
}

export function getEditableBusinessProfile(registration: Partial<RegistrationData>): BusinessProfile {
  return {
    businessName: registration.businessName ?? DUMMY.businessName,
    gstNumber: registration.gstNumber ?? DUMMY.gstNumber,
    phone: registration.phone ?? DUMMY.phone,
    email: registration.email ?? DUMMY.email,
    address: registration.address ?? DUMMY.address,
  };
}
