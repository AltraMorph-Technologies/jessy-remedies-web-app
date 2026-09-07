import type { Metadata } from 'next';
import { AuthForm } from '../../../components/auth-form';

export const metadata: Metadata = {
  title: 'Reset password | Jesse Remedies',
  description: 'Reset your Jesse Remedies account password.',
};

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />;
}
