import type { Metadata } from 'next';
import { OnboardingFlow } from '../../../../../components/onboarding-flow';

export const metadata: Metadata = {
  title: 'Onboard customer | Jesse Remedies Staff',
  description: 'Create and complete a customer onboarding record.',
};

export default function StaffCustomerOnboardingPage() {
  return <OnboardingFlow staffMode />;
}
