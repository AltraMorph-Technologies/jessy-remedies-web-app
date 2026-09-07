import type { Metadata } from 'next';
import { StaffTeam } from '../../../../components/staff-team';

export const metadata: Metadata = {
  title: 'Staff & roles | Jesse Remedies',
  description: 'Manage staff accounts and roles.',
};

export default function StaffTeamPage() {
  return <StaffTeam />;
}
