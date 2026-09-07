import type { Metadata } from 'next';
import { AuthForm } from '../../../components/auth-form';

export const metadata: Metadata = {
  title: 'Set new password | Jesse Remedies',
  description: 'Choose a new password for your Jesse Remedies account.',
};

export default function ResetPasswordPage() {
  return <AuthForm mode="reset-password" />;
}
