import type { Metadata } from 'next';
import { AuthForm } from '../../../components/auth-form';

export const metadata: Metadata = {
  title: 'Sign in | Jesse Remedies',
  description: 'Sign in to manage your Jesse Remedies loan application.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
