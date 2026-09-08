'use client';

import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
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
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getAccountAccess } from '../lib/staff-roles';
import { StaffFooter, StaffSidebar, StaffTopbar } from './staff-portal';

type CustomerRecord = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  onboarding_status:
    'draft' | 'complete' | 'action_required' | 'review_pending';
  completed_steps: number[];
  onboarding_data: Record<string, unknown>;
  document_verification: Record<
    string,
    {
      status: 'verified' | 'rejected';
      verified_at: string;
      verified_by: string;
    }
  >;
  registration_source: 'online' | 'staff';
  added_by: string | null;
  created_at: string;
};

type LoanRequest = {
  id: string;
  loan_type: string;
  amount: number;
  purpose: string;
  duration: string;
  repayment_frequency: string;
  status: string;
  created_at: string;
};

type LoanRequestForm = {
  loanType: string;
  purpose: string;
  amount: number;
  duration: string;
  repaymentFrequency: 'Weekly' | 'Monthly';
};

const documentFields = [
  { label: 'Passport', key: 'passportFile', pathKey: 'passportFilePath' },
  { label: 'Identification', key: 'idCardFile', pathKey: 'idCardFilePath' },
  {
    label: 'Utility document',
    key: 'utilityFile',
    pathKey: 'utilityFilePath',
  },
  {
    label: 'Bank statement',
    key: 'bankStatementFile',
    pathKey: 'bankStatementFilePath',
  },
] as const;

export function StaffCustomerDetails({ customerId }: { customerId: string }) {
  const [loanForm] = Form.useForm<LoanRequestForm>();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [addedBy, setAddedBy] = useState('Online registration');
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [staffId, setStaffId] = useState('');
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState('');
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [loanNotice, setLoanNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      window.location.replace('/login');
      return;
    }

    void supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) {
        window.location.replace('/login');
        return;
      }
      const access = await getAccountAccess(supabase, user.id);
      if (!access.staffRole) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setStaffId(user.id);

      const { data: record } = await supabase
        .from('customers')
        .select(
          'id, auth_user_id, first_name, last_name, email, phone, onboarding_status, completed_steps, onboarding_data, document_verification, registration_source, added_by, created_at',
        )
        .eq('id', customerId)
        .maybeSingle();
      if (!record) {
        setLoading(false);
        return;
      }

      const typedRecord = record as CustomerRecord;
      let resolvedRecord: CustomerRecord = {
        ...typedRecord,
        document_verification: typedRecord.document_verification ?? {},
      };
      if (typedRecord.added_by) {
        const { data: creator } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', typedRecord.added_by)
          .maybeSingle();
        setAddedBy(
          `${creator?.first_name ?? ''} ${creator?.last_name ?? ''}`.trim() ||
            'Staff member',
        );
      }
      if (typedRecord.auth_user_id) {
        const { data: onboarding } = await supabase
          .from('loan_applications')
          .select('status, form_data')
          .eq('user_id', typedRecord.auth_user_id)
          .maybeSingle();
        if (onboarding && onboarding.status !== 'draft') {
          resolvedRecord = {
            ...resolvedRecord,
            completed_steps: [0, 1, 2, 3],
            onboarding_data: {
              ...resolvedRecord.onboarding_data,
              ...(onboarding.form_data ?? {}),
            },
          };
        }
      }

      const { data: requests } = await supabase
        .from('loan_requests')
        .select(
          'id, loan_type, amount, purpose, duration, repayment_frequency, status, created_at',
        )
        .eq('customer_id', typedRecord.id)
        .order('created_at', { ascending: false });
      setLoans((requests ?? []) as LoanRequest[]);

      setCustomer(resolvedRecord);
      const previews = await Promise.all(
        documentFields.map(async ({ key, pathKey }) => {
          const path = String(resolvedRecord.onboarding_data[pathKey] ?? '');
          if (!path) return [key, ''] as const;
          const { data: signedFile } = await supabase.storage
            .from('onboarding-documents')
            .createSignedUrl(path, 60 * 30);
          return [key, signedFile?.signedUrl ?? ''] as const;
        }),
      );
      setDocumentUrls(Object.fromEntries(previews));
      setLoading(false);
    });
  }, [customerId]);

  async function verifyDocument(key: string, status: 'verified' | 'rejected') {
    if (!customer || !staffId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setVerifying(key);
    const nextVerification = {
      ...customer.document_verification,
      [key]: {
        status,
        verified_at: new Date().toISOString(),
        verified_by: staffId,
      },
    };
    const allDocumentsVerified = documentFields.every(
      ({ key: documentKey, pathKey }) =>
        Boolean(customer.onboarding_data[pathKey]) &&
        nextVerification[documentKey]?.status === 'verified',
    );
    const onboardingStatus =
      status === 'rejected'
        ? 'action_required'
        : allDocumentsVerified
          ? 'complete'
          : 'review_pending';
    const { error } = await supabase
      .from('customers')
      .update({
        document_verification: nextVerification,
        onboarding_status: onboardingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id);
    if (!error) {
      setCustomer({
        ...customer,
        document_verification: nextVerification,
        onboarding_status: onboardingStatus,
      });
      await supabase.from('activity_logs').insert({
        actor_id: staffId,
        action:
          status === 'verified' ? 'document_verified' : 'document_rejected',
        entity_type: 'customer',
        entity_id: customer.id,
        details: {
          document: documentFields.find((document) => document.key === key)
            ?.label,
          customer: `${customer.first_name} ${customer.last_name}`.trim(),
        },
      });
    }
    setVerifying('');
  }

  async function applyForCustomer(values: LoanRequestForm) {
    if (!customer || !staffId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSubmittingLoan(true);
    setLoanNotice(null);
    try {
      const { data: loan, error } = await supabase
        .from('loan_requests')
        .insert({
          user_id: customer.auth_user_id,
          customer_id: customer.id,
          loan_type: values.loanType,
          purpose: values.purpose,
          amount: values.amount,
          duration: values.duration,
          repayment_frequency: values.repaymentFrequency,
        })
        .select(
          'id, loan_type, amount, purpose, duration, repayment_frequency, status, created_at',
        )
        .single();
      if (error) throw error;

      setLoans((current) => [loan as LoanRequest, ...current]);
      loanForm.resetFields();
      setLoanNotice({
        type: 'success',
        text: 'Loan application submitted for this customer.',
      });
      await supabase.from('activity_logs').insert({
        actor_id: staffId,
        action: 'customer_loan_submitted',
        entity_type: 'customer',
        entity_id: customer.id,
        details: { loan_request_id: loan.id, amount: values.amount },
      });
    } catch (error) {
      setLoanNotice({
        type: 'error',
        text: errorMessage(error, 'Could not submit the loan application.'),
      });
    } finally {
      setSubmittingLoan(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" description="Loading customer..." />
      </main>
    );
  }

  if (!authorized || !customer) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-5 text-center">
        <div className="rounded-3xl bg-white p-8">
          <h1 className="text-2xl font-black text-[#101b36]">
            {authorized ? 'Customer not found' : 'Staff access required'}
          </h1>
          <Link
            href="/portal/customers"
            className="mt-5 inline-block font-bold text-[#173a76]"
          >
            Back to customers
          </Link>
        </div>
      </main>
    );
  }

  const data = customer.onboarding_data;
  const fullName =
    `${customer.first_name || value(data.firstName)} ${customer.last_name || value(data.surname)}`.trim() ||
    'Unnamed customer';

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#101b36] lg:grid lg:grid-cols-[240px_1fr]">
      <StaffSidebar active="customers" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <StaffTopbar />
        <div className="flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <Link
            href="/portal/customers"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#71809a]"
          >
            <ArrowLeftOutlined /> Back to customers
          </Link>

          <header className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef3fb] text-xl font-black text-[#173a76]">
                {(customer.first_name[0] ?? 'C').toUpperCase()}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                    {fullName}
                  </h1>
                  <Tag color={customerStatus(customer.onboarding_status).color}>
                    {customerStatus(customer.onboarding_status).label}
                  </Tag>
                </div>
                <p className="mt-2 text-sm text-[#71809a]">
                  Added by{' '}
                  {customer.registration_source === 'online'
                    ? 'Online registration'
                    : addedBy}
                  {' · '}
                  {formatDate(customer.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {customer.registration_source === 'staff' &&
                ['draft', 'action_required'].includes(
                  customer.onboarding_status,
                ) && (
                  <Link
                    href={`/portal/customers/new?customer=${customer.id}`}
                    className="inline-flex w-fit rounded-xl bg-[#173a76] px-5 py-3 text-sm font-black text-white"
                  >
                    Continue onboarding
                  </Link>
                )}
              <a
                href="#documents"
                className="inline-flex items-center gap-2 rounded-xl bg-[#eef3fb] px-5 py-3 text-sm font-black text-[#173a76]"
              >
                <CheckOutlined /> Verify
              </a>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={customer.onboarding_status !== 'complete'}
                onClick={() => {
                  setLoanNotice(null);
                  setLoanModalOpen(true);
                }}
                className="!h-auto !rounded-xl !border-0 !bg-[#173a76] !px-5 !py-3 !font-black !text-white !shadow-none"
              >
                Apply loan
              </Button>
            </div>
          </header>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <DetailSection icon={<UserOutlined />} title="Personal information">
              <Detail label="Date of birth" value={value(data.dob)} />
              <Detail label="Gender" value={value(data.gender)} />
              <Detail
                label="Marital status"
                value={value(data.maritalStatus)}
              />
              <Detail label="Nationality" value={value(data.nationality)} />
              <Detail
                label="State / LGA"
                value={`${value(data.stateOfOrigin)} / ${value(data.lgaOfOrigin)}`}
              />
              <Detail
                label="Residential address"
                value={value(data.residentialAddress)}
                wide
              />
            </DetailSection>

            <DetailSection
              icon={<IdcardOutlined />}
              title="Contact and account"
            >
              <Detail
                label="Email"
                value={customer.email || value(data.emailAddress)}
                icon={<MailOutlined />}
              />
              <Detail
                label="Phone"
                value={customer.phone || value(data.phoneNumber)}
                icon={<PhoneOutlined />}
              />
              <Detail
                label="Alternative phone"
                value={value(data.altPhoneNumber)}
              />
              <Detail
                label="Registration source"
                value={
                  customer.registration_source === 'online'
                    ? 'Online registration'
                    : addedBy
                }
              />
            </DetailSection>

            <DetailSection
              icon={<FileTextOutlined />}
              title="Employment information"
            >
              <Detail label="Company" value={value(data.companyName)} />
              <Detail label="Branch" value={value(data.companyBranch)} />
              <Detail
                label="Position / rank"
                value={value(data.positionRank)}
              />
              <Detail
                label="Employment status"
                value={value(data.employmentStatus)}
              />
              <Detail
                label="Monthly salary"
                value={money(data.monthlySalary)}
              />
              <Detail
                label="Workplace address"
                value={value(data.workplaceAddress)}
                wide
              />
            </DetailSection>

            <DetailSection icon={<BankOutlined />} title="Bank information">
              <Detail label="Bank" value={value(data.bankName)} />
              <Detail label="Account name" value={value(data.accountName)} />
              <Detail
                label="Account number"
                value={mask(value(data.accountNumber))}
              />
              <Detail label="BVN" value={mask(value(data.bvnNumber))} />
            </DetailSection>
          </section>

          <section
            id="documents"
            className="mt-6 scroll-mt-6 rounded-3xl border border-[#101b36]/8 bg-white p-6 sm:p-8"
          >
            <h2 className="text-xl font-black">Documents</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {documentFields.map(({ label, key }) => {
                const fileName = value(data[`${key}Name`]);
                const review = customer.document_verification[key];
                const hasFile = fileName !== '—' && Boolean(documentUrls[key]);
                return (
                  <div
                    key={key}
                    className="flex min-h-48 flex-col rounded-2xl bg-[#f7f8fb] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#71809a] uppercase">
                        {label}
                      </p>
                      <Tag
                        className="!m-0"
                        color={
                          review?.status === 'verified'
                            ? 'green'
                            : review?.status === 'rejected'
                              ? 'red'
                              : 'default'
                        }
                      >
                        {review?.status ?? 'Pending'}
                      </Tag>
                    </div>
                    <p className="mt-3 truncate text-sm font-bold">
                      {fileName}
                    </p>
                    {hasFile ? (
                      <a
                        href={documentUrls[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#173a76]"
                      >
                        <EyeOutlined /> View document
                      </a>
                    ) : (
                      <p className="mt-3 text-xs text-[#8a96aa]">
                        No document uploaded
                      </p>
                    )}
                    <div className="mt-auto flex gap-2 pt-5">
                      <Button
                        size="small"
                        icon={<CheckOutlined />}
                        disabled={!hasFile}
                        loading={verifying === key}
                        onClick={() => void verifyDocument(key, 'verified')}
                        className="!border-[#236d63] !text-[#236d63]"
                      >
                        Verify
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<CloseOutlined />}
                        disabled={!hasFile}
                        onClick={() => void verifyDocument(key, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-[#101b36]/8 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-black">Loan requests</h2>
            {loans.length ? (
              <div className="mt-5 grid gap-3">
                {loans.map((loan) => (
                  <article
                    key={loan.id}
                    className="grid gap-3 rounded-2xl bg-[#f7f8fb] p-4 sm:grid-cols-2 sm:items-center xl:grid-cols-5"
                  >
                    <div>
                      <p className="text-xs text-[#71809a]">Loan type</p>
                      <strong>{loan.loan_type}</strong>
                    </div>
                    <div>
                      <p className="text-xs text-[#71809a]">Amount</p>
                      <strong>{money(loan.amount)}</strong>
                    </div>
                    <div>
                      <p className="text-xs text-[#71809a]">Purpose</p>
                      <strong>{loan.purpose}</strong>
                    </div>
                    <div>
                      <p className="text-xs text-[#71809a]">Term</p>
                      <strong>
                        {loan.duration} · {loan.repayment_frequency}
                      </strong>
                    </div>
                    <Tag className="w-fit" color="blue">
                      {loan.status.replace('_', ' ')}
                    </Tag>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#71809a]">
                No loan requests yet.
              </p>
            )}
          </section>

          <Modal
            open={loanModalOpen}
            onCancel={() => setLoanModalOpen(false)}
            footer={null}
            title={`Apply for a loan — ${fullName}`}
            centered
          >
            <p className="mt-2 text-sm leading-6 text-[#71809a]">
              Submit a loan request on behalf of this verified customer.
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
              onFinish={(values) => void applyForCustomer(values)}
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
                rules={[
                  { required: true, message: 'Enter the amount requested' },
                ]}
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
                <Button onClick={() => setLoanModalOpen(false)}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingLoan}
                  className="!border-0 !bg-[#173a76] !font-bold !text-white !shadow-none"
                >
                  Submit application
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
        <StaffFooter />
      </div>
    </main>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#101b36]/8 bg-white p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f4] text-[#236d63]">
          {icon}
        </span>
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      <dl className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Detail({
  label,
  value: detailValue,
  icon,
  wide = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-bold tracking-[0.06em] text-[#8a96aa] uppercase">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-2 font-bold break-words">
        {icon}
        {detailValue || '—'}
      </dd>
    </div>
  );
}

function value(input: unknown) {
  return input === undefined || input === null || input === ''
    ? '—'
    : String(input);
}

function mask(input: string) {
  if (!input || input === '—') return '—';
  return `••••••${input.slice(-4)}`;
}

function money(input: unknown) {
  const amount = Number(input);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(amount)
    : '—';
}

function formatDate(input: string) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(
    new Date(input),
  );
}

function customerStatus(status: CustomerRecord['onboarding_status']) {
  if (status === 'complete') return { label: 'Onboarded', color: 'green' };
  if (status === 'action_required')
    return { label: 'Action required', color: 'red' };
  if (status === 'review_pending') return { label: 'Reviewing', color: 'blue' };
  return { label: 'In progress', color: 'gold' };
}
