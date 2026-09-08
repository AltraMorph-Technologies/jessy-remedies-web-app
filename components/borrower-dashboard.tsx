'use client';

import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { User } from '@supabase/supabase-js';
import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Spin,
  Tag,
} from 'antd';
import Link from './app-link';
import { useEffect, useState } from 'react';
import { errorMessage } from '../lib/errors';
import { getAccountAccess } from '../lib/staff-roles';
import { getSupabaseBrowserClient } from '../lib/supabase';

const documentLabels: Record<string, string> = {
  passportFile: 'Passport photograph',
  idCardFile: 'Means of identification',
  utilityFile: 'Utility document',
  bankStatementFile: 'Bank statement',
};

export function BorrowerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [loanRequestCount, setLoanRequestCount] = useState(0);
  const [hasStaffAccess, setHasStaffAccess] = useState(false);
  const [pageNotice, setPageNotice] = useState<string | null>(null);
  const [loanNotice, setLoanNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loanForm] = Form.useForm();
  const [application, setApplication] = useState<{
    status: string;
    completed_steps: number[];
  } | null>(null);
  const [customerReview, setCustomerReview] = useState<{
    id: string;
    onboarding_status: string;
    document_verification: Record<string, { status: string }>;
  } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      window.location.replace('/login');
      return;
    }

    void (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) {
        window.location.replace('/login');
        return;
      }

      const currentUser = data.session.user;
      setUser(currentUser);
      const access = await getAccountAccess(supabase, currentUser.id);
      if (!access.hasBorrowerAccess && access.staffRole) {
        window.location.replace('/portal');
        return;
      }
      setHasStaffAccess(Boolean(access.staffRole));

      const [applicationResult, requestResult, customerResult] =
        await Promise.all([
          supabase
            .from('loan_applications')
            .select('status, completed_steps')
            .eq('user_id', currentUser.id)
            .maybeSingle(),
          supabase
            .from('loan_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id),
          supabase
            .from('customers')
            .select('id, onboarding_status, document_verification')
            .eq('auth_user_id', currentUser.id)
            .maybeSingle(),
        ]);
      const loadError =
        applicationResult.error ?? requestResult.error ?? customerResult.error;
      if (loadError) throw loadError;

      setApplication(applicationResult.data ?? null);
      setLoanRequestCount(requestResult.count ?? 0);
      setCustomerReview(customerResult.data ?? null);
    })()
      .catch((error: unknown) => {
        setPageNotice(
          errorMessage(
            error,
            'Could not load all of your account information.',
          ),
        );
      })
      .finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.replace('/login');
      else setUser(session.user);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.replace('/login');
    } catch (error) {
      setPageNotice(errorMessage(error, 'Could not sign you out.'));
      setSigningOut(false);
    }
  }

  async function handleAccountMenu({ key }: { key: string }) {
    if (key === 'signout') await signOut();
  }

  function applyForLoan() {
    if (customerReview?.onboarding_status === 'review_pending') {
      setPageNotice(
        'Your onboarding information is being reviewed. You can apply after staff verify your documents.',
      );
      return;
    }
    if (customerReview?.onboarding_status !== 'complete') {
      window.location.assign('/onboarding');
      return;
    }
    setLoanNotice(null);
    setLoanModalOpen(true);
  }

  async function submitLoan(values: {
    loanType: string;
    purpose: string;
    amount: number;
    duration: string;
    repaymentFrequency: string;
  }) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    setSubmittingLoan(true);
    setLoanNotice(null);

    try {
      const { error } = await supabase.from('loan_requests').insert({
        user_id: user.id,
        customer_id: customerReview?.id ?? null,
        loan_type: values.loanType,
        purpose: values.purpose,
        amount: values.amount,
        duration: values.duration,
        repayment_frequency: values.repaymentFrequency,
      });
      if (error) throw error;

      setLoanRequestCount((count) => count + 1);
      loanForm.resetFields();
      setLoanNotice({
        type: 'success',
        text: 'Your loan request has been submitted.',
      });
    } catch (error) {
      const message = errorMessage(
        error,
        'Could not submit your loan request.',
      );
      setLoanNotice({
        type: 'error',
        text: message.includes('loan_requests')
          ? 'The loan request database setup is not complete yet.'
          : message,
      });
    } finally {
      setSubmittingLoan(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" description="Loading your account..." />
      </main>
    );
  }

  const firstName = String(user.user_metadata.first_name ?? 'Borrower');
  const lastName = String(user.user_metadata.last_name ?? '');
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? 'B'}${lastName[0] ?? ''}`.toUpperCase();
  const progress = application?.completed_steps.length ?? 0;
  const applicationStatus = application?.status ?? 'Not started';
  const needsDocumentReplacement =
    customerReview?.onboarding_status === 'action_required';
  const onboardingReviewing =
    customerReview?.onboarding_status === 'review_pending';
  const onboardingComplete = customerReview?.onboarding_status === 'complete';
  const rejectedDocuments = Object.entries(
    customerReview?.document_verification ?? {},
  )
    .filter(([, review]) => review.status === 'rejected')
    .map(([key]) => documentLabels[key] ?? 'Document');

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#101b36]">
      <header className="border-b border-[#101b36]/8 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#173a76] text-sm font-black text-white">
              JR
            </span>
            <span>
              <strong className="block leading-none">Jesse Remedies</strong>
              <span className="mt-1 block text-[10px] font-bold tracking-[0.15em] text-[#71809a] uppercase">
                Borrower portal
              </span>
            </span>
          </Link>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              onClick: (info) => void handleAccountMenu(info),
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  disabled: true,
                  label: (
                    <div className="min-w-48 py-1">
                      <strong className="block text-[#1f2937]">
                        {fullName}
                      </strong>
                      <span className="text-xs text-[#71809a]">
                        {user.email}
                      </span>
                    </div>
                  ),
                },
                ...(hasStaffAccess
                  ? [
                      {
                        key: 'staff-portal',
                        icon: <BankOutlined />,
                        label: <Link href="/portal">Staff portal</Link>,
                      },
                    ]
                  : []),
                { type: 'divider' },
                {
                  key: 'signout',
                  icon: <LogoutOutlined />,
                  label: signingOut ? 'Signing out...' : 'Sign out',
                  danger: true,
                  disabled: signingOut,
                },
              ],
            }}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#f3f6fb] sm:gap-3"
            >
              <span className="hidden text-right sm:block">
                <strong className="block text-sm">{fullName}</strong>
                <span className="text-xs text-[#71809a]">{user.email}</span>
              </span>
              <Avatar className="!bg-[#eef7f4] !font-black !text-[#236d63]">
                {initials}
              </Avatar>
              <DownOutlined className="text-xs text-[#6b7280]" />
            </button>
          </Dropdown>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {pageNotice && (
          <Alert
            showIcon
            closable
            type="error"
            title={pageNotice}
            onClose={() => setPageNotice(null)}
            className="mb-6"
          />
        )}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.15em] text-[#236d63] uppercase">
              Account overview
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              Welcome, {firstName}.
            </h1>
            <p className="mt-3 text-[#71809a]">
              Here is a quick view of your borrowing journey.
            </p>
          </div>
          <Button
            type="primary"
            onClick={applyForLoan}
            disabled={onboardingReviewing}
            className="!h-12 !w-fit !rounded-xl !border-0 !bg-[#173a76] !px-5 !font-black !text-white !shadow-none"
          >
            {onboardingReviewing
              ? 'Application under review'
              : onboardingComplete
                ? 'Apply for a loan'
                : 'Continue onboarding'}{' '}
            <ArrowRightOutlined />
          </Button>
        </section>

        {needsDocumentReplacement && (
          <Alert
            type="error"
            showIcon
            title="Document replacement required"
            description={`${rejectedDocuments.join(', ')} ${rejectedDocuments.length === 1 ? 'was' : 'were'} rejected. Upload the replacement to continue.`}
            action={
              <Link
                href="/onboarding"
                className="font-black whitespace-nowrap text-[#173a76]"
              >
                Replace now
              </Link>
            }
          />
        )}

        <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<BankOutlined />}
            label="Active loans"
            value="0"
            note="No active loan"
          />
          <SummaryCard
            icon={<FileTextOutlined />}
            label="Applications"
            value={String(loanRequestCount)}
            note="Loan requests submitted"
          />
          <SummaryCard
            icon={<CalendarOutlined />}
            label="Next payment"
            value="—"
            note="Nothing due"
          />
          <SummaryCard
            icon={<CheckCircleOutlined />}
            label="Account status"
            value={
              needsDocumentReplacement
                ? 'Action required'
                : onboardingReviewing
                  ? 'Reviewing'
                  : applicationStatus === 'draft'
                    ? 'Draft'
                    : applicationStatus
            }
            note={
              needsDocumentReplacement
                ? 'Replace rejected document'
                : onboardingReviewing
                  ? 'Documents under staff review'
                  : applicationStatus === 'draft'
                    ? 'Continue when ready'
                    : 'Account ready'
            }
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] bg-[#101b36] p-7 text-white sm:p-9">
            <Tag className="!m-0 !border-0 !bg-white/10 !text-white/70">
              NEXT STEP
            </Tag>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">
              Ready to find the right loan?
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-white/60">
              Calculate an estimated repayment, then start your application when
              the amount and duration work for you.
            </p>
            <Button
              type="text"
              onClick={applyForLoan}
              disabled={onboardingReviewing}
              className="mt-7 !h-11 !rounded-xl !border-0 !bg-[#173a76] !px-5 !font-black !text-white !shadow-none"
            >
              {onboardingReviewing
                ? 'Application under review'
                : onboardingComplete
                  ? 'Apply for a loan'
                  : progress > 0
                    ? 'Resume onboarding'
                    : 'Start onboarding'}
            </Button>
          </div>

          <div className="rounded-[1.75rem] border border-[#101b36]/8 bg-white p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f4] text-[#236d63]">
                <UserOutlined />
              </span>
              <h2 className="text-lg font-black">Account details</h2>
            </div>
            <dl className="mt-6 space-y-5 text-sm">
              <Detail label="Name" value={fullName} />
              <Detail label="Email" value={user.email ?? 'Not provided'} />
              <Detail
                label="Phone"
                value={String(user.user_metadata.phone ?? 'Not provided')}
              />
            </dl>
          </div>
        </section>
      </div>

      <Modal
        open={loanModalOpen}
        onCancel={() => setLoanModalOpen(false)}
        footer={null}
        title="Apply for a loan"
        centered
      >
        <p className="mt-2 text-sm leading-6 text-[#71809a]">
          Tell us what you need. Your completed onboarding details will be used
          for assessment.
        </p>
        {loanNotice && (
          <Alert showIcon type={loanNotice.type} title={loanNotice.text} />
        )}
        <Form
          form={loanForm}
          layout="vertical"
          requiredMark={false}
          className="mt-5"
          initialValues={{ repaymentFrequency: 'Monthly' }}
          onFinish={(values) => void submitLoan(values)}
          onValuesChange={() => setLoanNotice(null)}
        >
          <Form.Item
            name="loanType"
            label="Loan type"
            rules={[{ required: true, message: 'Select a loan type' }]}
          >
            <Select
              size="large"
              placeholder="Select loan type"
              options={[
                'Business Loan',
                'Weekly Business Loan',
                'Employee Loan',
                'Special Loan',
              ].map((loanType) => ({ label: loanType, value: loanType }))}
            />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="Loan purpose"
            rules={[{ required: true, message: 'Enter the loan purpose' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount requested (₦)"
            rules={[{ required: true, message: 'Enter the amount requested' }]}
          >
            <InputNumber
              size="large"
              min={1000}
              step={1000}
              className="!w-full"
            />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Loan duration"
            rules={[{ required: true, message: 'Select a duration' }]}
          >
            <Select
              size="large"
              options={[1, 2, 3, 4, 5, 6, 9, 12].map((month) => ({
                label: `${month} ${month === 1 ? 'month' : 'months'}`,
                value: `${month} ${month === 1 ? 'month' : 'months'}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="repaymentFrequency"
            label="Repayment frequency"
            rules={[{ required: true }]}
          >
            <Radio.Group options={['Weekly', 'Monthly']} />
          </Form.Item>
          <div className="flex justify-end gap-3 border-t border-[#101b36]/8 pt-5">
            <Button type="text" onClick={() => setLoanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingLoan}
              className="!border-0 !bg-[#173a76] !font-bold !text-white !shadow-none"
            >
              Submit request
            </Button>
          </div>
        </Form>
      </Modal>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[#101b36]/8 bg-white p-6 shadow-[0_16px_50px_rgba(16,27,54,0.05)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f4] text-[#236d63]">
        {icon}
      </span>
      <p className="mt-5 text-xs font-bold tracking-[0.1em] text-[#71809a] uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-2 text-xs text-[#8a96aa]">{note}</p>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#101b36]/7 pb-4 last:border-0 last:pb-0">
      <dt className="text-xs font-bold tracking-[0.08em] text-[#8a96aa] uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-bold break-all text-[#101b36]">{value}</dd>
    </div>
  );
}
