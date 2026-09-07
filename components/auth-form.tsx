'use client';

import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Checkbox, Form, Input } from 'antd';
import Link from './app-link';
import { useState, useSyncExternalStore } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getAccountAccess } from '../lib/staff-roles';

type Mode = 'login' | 'register' | 'forgot-password' | 'reset-password';
type Values = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
};

const copy = {
  login: ['Welcome back', 'Sign in to your account', 'Sign in'],
  register: ['Get started', 'Create your account', 'Create account'],
  'forgot-password': [
    'Account recovery',
    'Reset your password',
    'Send reset link',
  ],
  'reset-password': [
    'Account recovery',
    'Set a new password',
    'Update password',
  ],
} as const;

const subscribeToClient = () => () => {};

export function AuthForm({ mode }: { mode: Mode }) {
  const [form] = Form.useForm<Values>();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [eyebrow, title, submitLabel] = copy[mode];

  async function submit(values: Values) {
    setNotice(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error(
          'Add your Supabase project URL and publishable key to .env.local.',
        );
      }

      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email!,
          password: values.password!,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              first_name: values.firstName,
              last_name: values.lastName,
              phone: values.phone,
            },
          },
        });
        if (error) throw error;
        form.resetFields();
        if (data.session) {
          window.location.assign('/dashboard');
          return;
        }
        setNotice({
          type: 'success',
          text: 'Account created. Check your email to confirm it.',
        });
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email!,
          password: values.password!,
        });
        if (error) throw error;
        const access = await getAccountAccess(supabase, data.user.id);
        window.location.assign(
          access.staffRole && access.hasBorrowerAccess
            ? '/choose-portal'
            : access.staffRole
              ? '/portal'
              : '/dashboard',
        );
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.email!,
          { redirectTo: `${window.location.origin}/reset-password` },
        );
        if (error) throw error;
        setNotice({
          type: 'success',
          text: 'If the email is registered, a reset link has been sent.',
        });
      } else {
        const { error } = await supabase.auth.updateUser({
          password: values.password!,
        });
        if (error) throw error;
        setNotice({ type: 'success', text: 'Password updated successfully.' });
      }
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const needsPassword = mode !== 'forgot-password';
  const needsConfirmation = mode === 'register' || mode === 'reset-password';

  if (!mounted) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <span className="text-sm font-bold text-[#71809a]">
          Loading securely…
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] lg:grid lg:h-screen lg:grid-cols-[0.92fr_1.08fr] lg:overflow-hidden">
      <aside className="relative hidden overflow-hidden bg-[#101b36] p-14 text-white lg:flex lg:h-screen lg:flex-col lg:justify-between">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <Brand light />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold tracking-[0.15em] text-[#7bc2b5] uppercase">
            Your financial journey
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[-0.055em]">
            Borrow with clarity. Move with confidence.
          </h1>
          <p className="mt-6 leading-8 text-white/60">
            Apply, track decisions and manage repayments in one secure place.
          </p>
        </div>
        <p className="relative flex items-center gap-3 text-sm text-white/55">
          <SafetyCertificateOutlined className="text-[#7bc2b5]" /> Your
          information is handled securely.
        </p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-2 py-6 sm:px-8 sm:py-10 lg:h-screen lg:min-h-0 lg:overflow-y-auto">
        <div className="w-full max-w-[510px]">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#60708f]"
          >
            <ArrowLeftOutlined /> Back to website
          </Link>

          <div className="rounded-[1.5rem] border border-[#101b36]/8 bg-white p-4 shadow-[0_24px_80px_rgba(16,27,54,0.08)] sm:rounded-[2rem] sm:p-9">
            <p className="text-xs font-black tracking-[0.15em] text-[#236d63] uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[#101b36] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#71809a]">
              {mode === 'register'
                ? 'Register to apply and follow your loan application.'
                : mode === 'login'
                  ? 'Continue your application and manage your loan.'
                  : mode === 'forgot-password'
                    ? 'Enter your email to receive a secure reset link.'
                    : 'Choose a secure password with at least 8 characters.'}
            </p>

            {notice && (
              <Alert showIcon type={notice.type} title={notice.text} />
            )}

            <Form
              form={form}
              className="mt-7"
              layout="vertical"
              requiredMark={false}
              onFinish={submit}
              onValuesChange={() => setNotice(null)}
            >
              {mode === 'register' && (
                <>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <TextField
                      label="First name"
                      name="firstName"
                      placeholder="First name"
                      autoComplete="given-name"
                      icon={<UserOutlined />}
                    />
                    <TextField
                      label="Last name"
                      name="lastName"
                      placeholder="Last name"
                      autoComplete="family-name"
                      icon={<UserOutlined />}
                    />
                  </div>
                  <Form.Item
                    label="Phone number"
                    name="phone"
                    rules={[
                      { required: true, message: 'Enter your phone number' },
                      {
                        pattern: /^(?:\+234|0)[789][01]\d{8}$/,
                        message: 'Enter a valid Nigerian phone number',
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<PhoneOutlined />}
                      placeholder="0801 234 5678"
                      autoComplete="tel"
                    />
                  </Form.Item>
                </>
              )}

              {mode !== 'reset-password' && (
                <Form.Item
                  label="Email address"
                  name="email"
                  rules={[
                    { required: true, message: 'Enter your email address' },
                    { type: 'email', message: 'Enter a valid email address' },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Form.Item>
              )}

              {needsPassword && (
                <PasswordField
                  name="password"
                  label="Password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                />
              )}

              {needsConfirmation && (
                <Form.Item
                  label="Confirm password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        return !value || getFieldValue('password') === value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error('The passwords do not match'),
                            );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </Form.Item>
              )}

              {mode === 'register' && (
                <Form.Item
                  name="terms"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error('Accept the terms to continue'),
                            ),
                    },
                  ]}
                >
                  <Checkbox>I agree to the Terms and Privacy Policy.</Checkbox>
                </Form.Item>
              )}

              {mode === 'login' && (
                <div className="-mt-2 mb-6 flex justify-end text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-bold text-[#173a76]"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                block
                htmlType="submit"
                loading={loading}
                size="large"
                type="primary"
                className="!h-12 !border-[#173a76] !bg-[#173a76] !font-black !text-white"
              >
                {submitLabel}
              </Button>
            </Form>

            <AuthFooter mode={mode} onNavigate={() => setNotice(null)} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="relative flex w-fit items-center gap-3">
      <span
        className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${light ? 'bg-white text-[#173a76]' : 'bg-[#173a76] text-white'}`}
      >
        JR
      </span>
      <strong className={light ? 'text-white' : 'text-[#101b36]'}>
        Jesse Remedies
      </strong>
    </Link>
  );
}

function TextField(props: {
  label: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
}) {
  return (
    <Form.Item
      label={props.label}
      name={props.name}
      rules={[
        { required: true, message: `Enter your ${props.label.toLowerCase()}` },
      ]}
    >
      <Input
        size="large"
        prefix={props.icon}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
      />
    </Form.Item>
  );
}

function PasswordField({
  name,
  label,
  autoComplete,
}: {
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        { required: true, message: 'Enter your password' },
        { min: 8, message: 'Password must be at least 8 characters' },
      ]}
    >
      <Input.Password
        size="large"
        prefix={<LockOutlined />}
        placeholder="Minimum 8 characters"
        autoComplete={autoComplete}
      />
    </Form.Item>
  );
}

function AuthFooter({
  mode,
  onNavigate,
}: {
  mode: Mode;
  onNavigate: () => void;
}) {
  const destination = mode === 'login' ? '/register' : '/login';
  const label =
    mode === 'login'
      ? 'Create account'
      : mode === 'register'
        ? 'Sign in'
        : 'Return to sign in';
  return (
    <p className="my-8 text-center text-sm text-[#71809a]">
      {mode === 'login' ? "Don't have an account? " : ''}
      {mode === 'register' ? 'Already have an account? ' : ''}
      <Link
        href={destination}
        onClick={onNavigate}
        className="font-black text-[#173a76]"
      >
        {label}
      </Link>
    </p>
  );
}
