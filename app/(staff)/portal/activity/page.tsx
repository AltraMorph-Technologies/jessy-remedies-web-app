import type { Metadata } from 'next';
import { StaffActivityLogs } from '../../../../components/staff-activity-logs';

export const metadata: Metadata = {
  title: 'Activity logs | Jesse Remedies',
  description: 'Review staff activity across the lending platform.',
};

export default function StaffActivityPage() {
  return <StaffActivityLogs />;
}
