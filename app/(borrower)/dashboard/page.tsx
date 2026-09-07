import type { Metadata } from 'next';
import { BorrowerDashboard } from '../../../components/borrower-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Jesse Remedies',
  description: 'Manage your Jesse Remedies loan account.',
};

export default function DashboardPage() {
  return <BorrowerDashboard />;
}
