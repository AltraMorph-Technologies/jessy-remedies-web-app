import type { Metadata } from 'next';
import { OnboardingFlow } from '../../../components/onboarding-flow';

export const metadata: Metadata = {
  title: 'Loan application | Jesse Remedies',
  description: 'Complete your Jesse Remedies loan application at your pace.',
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
