import type { Metadata } from 'next';
import { PortalChoice } from '../../../components/portal-choice';

export const metadata: Metadata = {
  title: 'Choose workspace | Jesse Remedies',
};

export default function ChoosePortalPage() {
  return <PortalChoice />;
}
