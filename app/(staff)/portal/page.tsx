import type { Metadata } from 'next';
import { StaffPortal } from '../../../components/staff-portal';

export const metadata: Metadata = {
  title: 'Staff dashboard | Jesse Remedies',
  description: 'Jesse Remedies staff operations dashboard.',
};

export default function StaffDashboardPage() {
  return <StaffPortal page="dashboard" />;
}
