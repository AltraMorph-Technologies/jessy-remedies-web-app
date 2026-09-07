import type { Metadata } from 'next';
import { StaffPortal } from '../../../../components/staff-portal';

export const metadata: Metadata = {
  title: 'Customers | Jesse Remedies Staff',
  description: 'Manage Jesse Remedies customers and onboarding.',
};

export default function StaffCustomersPage() {
  return <StaffPortal page="customers" />;
}
