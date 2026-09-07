'use client';

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  EyeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Progress,
  Select,
  Spin,
  Steps,
  Upload,
} from 'antd';
import Image from 'next/image';
import Link from './app-link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getAccountAccess } from '../lib/staff-roles';

type Draft = Record<string, unknown>;

const steps = ['Applicant', 'Employment', 'Bank', 'Documents'];

const stepFields: string[][] = [
  [
    'firstName',
    'middleName',
    'surname',
    'dob',
    'gender',
    'maritalStatus',
    'nationality',
    'stateOfOrigin',
    'lgaOfOrigin',
    'residentialAddress',
    'yearsAtAddress',
    'phoneNumber',
    'altPhoneNumber',
    'emailAddress',
  ],
  [
    'companyName',
    'companyBranch',
    'positionRank',
    'employmentStatus',
    'monthlySalary',
    'dateOfEmployment',
    'workplaceAddress',
  ],
  ['bankName', 'accountName', 'accountNumber', 'bvnNumber'],
  ['passportFile', 'idCardFile', 'utilityFile', 'bankStatementFile'],
];

const banks = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank',
  'Globus Bank',
  'Guaranty Trust Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Lotus Bank',
  'Parallex Bank',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank',
];

const uploadFields = [
  ['passportFile', 'Passport photograph', '.jpg,.jpeg,.png'],
  ['idCardFile', 'Means of identification', '.jpg,.jpeg,.png,.pdf'],
  ['utilityFile', 'Utility / residence verification', '.jpg,.jpeg,.png,.pdf'],
  ['bankStatementFile', 'Three months bank statement', '.pdf'],
] as const;

export function OnboardingFlow({ staffMode = false }: { staffMode?: boolean }) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [draft, setDraft] = useState<Draft>({});
  const [userId, setUserId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [documentVerification, setDocumentVerification] = useState<Draft>({});
  const [rejectedDocumentKeys, setRejectedDocumentKeys] = useState<string[]>(
    [],
  );
  const [correctingDocuments, setCorrectingDocuments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
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
      setUserId(user.id);

      if (staffMode) {
        const access = await getAccountAccess(supabase, user.id);
        if (!access.staffRole) {
          window.location.replace('/dashboard');
          return;
        }

        const savedCustomerId = new URLSearchParams(window.location.search).get(
          'customer',
        );
        if (savedCustomerId) {
          const { data: customer } = await supabase
            .from('customers')
            .select(
              'id, current_step, completed_steps, onboarding_data, onboarding_status, document_verification',
            )
            .eq('id', savedCustomerId)
            .maybeSingle();
          if (customer) {
            const saved = (customer.onboarding_data ?? {}) as Draft;
            const verification = (customer.document_verification ??
              {}) as Draft;
            const rejectedKeys = Object.entries(verification)
              .filter(([, review]) =>
                Boolean(
                  review &&
                  typeof review === 'object' &&
                  'status' in review &&
                  review.status === 'rejected',
                ),
              )
              .map(([key]) => key);
            for (const key of rejectedKeys) {
              delete saved[`${key}Path`];
              delete saved[`${key}Name`];
            }
            setCustomerId(customer.id);
            setDraft(saved);
            setDocumentVerification(verification);
            setRejectedDocumentKeys(rejectedKeys);
            setCorrectingDocuments(rejectedKeys.length > 0);
            setStep(
              rejectedKeys.length
                ? steps.length - 1
                : customer.onboarding_status !== 'complete'
                  ? Math.min(customer.current_step, steps.length - 1)
                  : 0,
            );
            setCompleted(
              rejectedKeys.length
                ? (customer.completed_steps ?? []).filter(
                    (item: number) => item !== 3,
                  )
                : (customer.completed_steps ?? []),
            );
            form.setFieldsValue(saved);
          }
        }
        setLoading(false);
        return;
      }

      const { data: application, error } = await supabase
        .from('loan_applications')
        .select('current_step, completed_steps, form_data, status')
        .eq('user_id', user.id)
        .maybeSingle();
      const { data: customerRecord } = await supabase
        .from('customers')
        .select('id, onboarding_status, document_verification')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        setNotice({ type: 'error', text: readableError(error.message) });
      } else if (application) {
        const saved = (application.form_data ?? {}) as Draft;
        const verification = (customerRecord?.document_verification ??
          {}) as Draft;
        const rejectedKeys = Object.entries(verification)
          .filter(([, review]) =>
            Boolean(
              review &&
              typeof review === 'object' &&
              'status' in review &&
              review.status === 'rejected',
            ),
          )
          .map(([key]) => key);
        setCustomerId(customerRecord?.id ?? '');
        setDocumentVerification(verification);
        setRejectedDocumentKeys(rejectedKeys);
        setCorrectingDocuments(rejectedKeys.length > 0);
        for (const key of rejectedKeys) {
          delete saved[`${key}Path`];
          delete saved[`${key}Name`];
        }
        const progress = normalizeOnboardingProgress(
          application.current_step,
          application.completed_steps ?? [],
          saved,
        );
        setDraft(saved);
        setStep(
          rejectedKeys.length
            ? steps.length - 1
            : application.status === 'draft'
              ? progress.currentStep
              : 0,
        );
        setCompleted(
          rejectedKeys.length
            ? progress.completedSteps.filter((item) => item !== 3)
            : progress.completedSteps,
        );
        form.setFieldsValue(saved);
        if (rejectedKeys.length) {
          setNotice({
            type: 'error',
            text: 'A document was rejected. Upload the requested replacement and resubmit it for review.',
          });
        }
      } else {
        const profile = {
          firstName: user.user_metadata.first_name,
          surname: user.user_metadata.last_name,
          phoneNumber: user.user_metadata.phone,
          emailAddress: user.email,
          nationality: 'Nigerian',
        };
        setDraft(profile);
        form.setFieldsValue(profile);
      }
      setLoading(false);
    });
  }, [form, staffMode]);

  async function save({
    validate = false,
    nextStep = step,
  }: { validate?: boolean; nextStep?: number } = {}) {
    setNotice(null);
    if (validate) await form.validateFields(stepFields[step]);
    const values = form.getFieldsValue(true) as Draft;
    const merged = { ...draft, ...values };
    const replacedDocuments = uploadFields
      .filter(([field]) => {
        const files = values[field] as UploadFile[] | undefined;
        return Boolean(files?.[0]?.originFileObj);
      })
      .map(([field]) => field);
    const nextDocumentVerification = { ...documentVerification };
    for (const field of replacedDocuments) {
      delete nextDocumentVerification[field];
    }

    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !userId) throw new Error('Your session has expired.');

      let savedCustomerId = customerId;
      if (staffMode && !savedCustomerId) {
        const { data: createdCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            first_name: String(merged.firstName ?? ''),
            last_name: String(merged.surname ?? ''),
            email: String(merged.emailAddress ?? ''),
            phone: String(merged.phoneNumber ?? ''),
            registration_source: 'staff',
            added_by: userId,
            onboarding_data: merged,
          })
          .select('id')
          .single();
        if (createError) throw createError;
        savedCustomerId = createdCustomer.id;
        setCustomerId(savedCustomerId);
        await supabase.from('activity_logs').insert({
          actor_id: userId,
          action: 'customer_created',
          entity_type: 'customer',
          entity_id: savedCustomerId,
          details: {
            name: `${String(merged.firstName ?? '')} ${String(merged.surname ?? '')}`.trim(),
            source: 'staff onboarding',
          },
        });
        window.history.replaceState(
          null,
          '',
          `/portal/customers/new?customer=${savedCustomerId}`,
        );
      }

      const uploadOwner = staffMode ? `${userId}/${savedCustomerId}` : userId;
      if (step === 3) await uploadDocuments(supabase, uploadOwner, merged);
      for (const [field] of uploadFields) delete merged[field];

      const nextCompleted = validate
        ? Array.from(new Set([...completed, step])).sort()
        : completed;

      if (staffMode) {
        const { error } = await supabase
          .from('customers')
          .update({
            first_name: String(merged.firstName ?? ''),
            last_name: String(merged.surname ?? ''),
            email: String(merged.emailAddress ?? ''),
            phone: String(merged.phoneNumber ?? ''),
            current_step: nextStep,
            completed_steps: nextCompleted,
            onboarding_data: merged,
            document_verification: nextDocumentVerification,
            onboarding_status: 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedCustomerId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('loan_applications').upsert(
          {
            user_id: userId,
            current_step: nextStep,
            completed_steps: nextCompleted,
            form_data: merged,
            status: 'draft',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        if (error) throw error;

        await supabase
          .from('customers')
          .update({
            first_name: String(merged.firstName ?? ''),
            last_name: String(merged.surname ?? ''),
            email: String(merged.emailAddress ?? ''),
            phone: String(merged.phoneNumber ?? ''),
            current_step: nextStep,
            completed_steps: nextCompleted,
            onboarding_data: merged,
            document_verification: nextDocumentVerification,
            onboarding_status: correctingDocuments ? 'review_pending' : 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('auth_user_id', userId);
      }
      setDraft(merged);
      setDocumentVerification(nextDocumentVerification);
      setCompleted(nextCompleted);
      setNotice({ type: 'success', text: 'Progress saved.' });
      return true;
    } catch (error) {
      setNotice({
        type: 'error',
        text: readableError(
          error instanceof Error ? error.message : 'Could not save.',
        ),
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (await save({ validate: true, nextStep: step + 1 })) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function submit() {
    if (!(await save({ validate: true, nextStep: step }))) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    const completedAt = new Date().toISOString();
    const { error } = staffMode
      ? await supabase
          .from('customers')
          .update({
            onboarding_status: correctingDocuments
              ? 'review_pending'
              : 'complete',
            onboarding_completed_at: completedAt,
          })
          .eq('id', customerId)
      : await supabase
          .from('loan_applications')
          .update({ status: 'submitted', submitted_at: completedAt })
          .eq('user_id', userId);
    if (!staffMode && !error) {
      await supabase
        .from('customers')
        .update({
          onboarding_status: correctingDocuments
            ? 'review_pending'
            : 'complete',
          onboarding_completed_at: completedAt,
        })
        .eq('auth_user_id', userId);
    }
    setSaving(false);
    if (staffMode && !error) {
      await supabase.from('activity_logs').insert({
        actor_id: userId,
        action: 'customer_onboarding_completed',
        entity_type: 'customer',
        entity_id: customerId,
        details: {},
      });
    }
    if (error) setNotice({ type: 'error', text: readableError(error.message) });
    else window.location.assign(staffMode ? '/portal/customers' : '/dashboard');
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" description="Loading onboarding..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb]">
      <header className="border-b border-[#101b36]/8 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-8">
          <Link
            href={staffMode ? '/portal' : '/dashboard'}
            className="flex items-center gap-3 font-black"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173a76] text-sm text-white">
              JR
            </span>
            Jesse Remedies
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={staffMode ? '/portal' : '/dashboard'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#eef2f7] px-4 py-2.5 text-sm font-black text-[#173a76]"
            >
              <DashboardOutlined />{' '}
              {staffMode ? 'Staff dashboard' : 'Dashboard'}
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#71809a]">
                ONBOARDING PROGRESS
              </p>
              <p className="mt-1 text-sm font-black">
                {completed.length} of {steps.length} sections
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-5 lg:grid lg:grid-cols-[270px_1fr] lg:gap-8 lg:px-8">
        <aside className="mb-5 rounded-2xl bg-[#101b36] p-5 text-white lg:sticky lg:top-8 lg:mb-0 lg:h-fit">
          <p className="text-xs font-bold tracking-[0.12em] text-white/50 uppercase">
            Account onboarding
          </p>
          <h1 className="mt-3 text-2xl font-black">
            Complete it at your pace.
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Complete your profile once, then apply for loans from your
            dashboard.
          </p>
          <Progress
            className="mt-5"
            percent={Math.round((completed.length / steps.length) * 100)}
            strokeColor="#7bc2b5"
            trailColor="rgba(255,255,255,.12)"
          />
          <Steps
            className="onboarding-steps mt-6 hidden lg:block"
            current={step}
            direction="vertical"
            items={steps.map((title, index) => ({
              title,
              status: completed.includes(index)
                ? 'finish'
                : index === step
                  ? 'process'
                  : 'wait',
            }))}
          />
        </aside>

        <section className="overflow-hidden rounded-[1.5rem] border border-[#101b36]/8 bg-white p-2 shadow-[0_20px_70px_rgba(16,27,54,.07)] sm:p-3">
          <div className="border-b border-[#101b36]/8 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
            <p className="text-xs font-black tracking-[0.12em] text-[#236d63] uppercase">
              Section {step + 1} of {steps.length}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
              {steps[step]} information
            </h2>
          </div>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            className="p-5 sm:p-8 lg:p-10"
            onValuesChange={() => setNotice(null)}
          >
            {notice && (
              <Alert showIcon type={notice.type} title={notice.text} />
            )}
            <StepContent
              step={step}
              draft={draft}
              editableDocumentKeys={
                correctingDocuments ? rejectedDocumentKeys : undefined
              }
            />

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#101b36]/8 pt-5 sm:flex-row sm:items-center">
              <Button
                type="text"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => void save()}
                className="!h-11 !w-full !rounded-xl !border-0 !bg-[#eef2f7] !font-bold !text-[#52617d] !shadow-none sm:!w-auto"
              >
                Save and exit later
              </Button>
              <div className="flex gap-3 sm:ml-auto">
                {step > 0 && (
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setStep((value) => value - 1)}
                    className="!h-11 !flex-1 !rounded-xl !border-0 !bg-[#eef2f7] !font-bold !text-[#52617d] !shadow-none sm:!flex-none"
                  >
                    Previous
                  </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={() => void next()}
                    className="!h-11 !flex-1 !rounded-xl !border-0 !bg-[#173a76] !font-bold !text-white !shadow-none sm:!flex-none"
                  >
                    Save & continue <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    loading={saving}
                    icon={<CheckOutlined />}
                    onClick={() => void submit()}
                    className="!h-11 !flex-1 !rounded-xl !border-0 !bg-[#173a76] !font-bold !text-white !shadow-none sm:!flex-none"
                  >
                    Complete onboarding
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </section>
      </div>
    </main>
  );
}

function StepContent({
  step,
  draft,
  editableDocumentKeys,
}: {
  step: number;
  draft: Draft;
  editableDocumentKeys?: string[];
}) {
  if (step === 0) return <ApplicantFields />;
  if (step === 1) return <EmploymentFields />;
  if (step === 2) return <BankFields />;
  return (
    <DocumentFields draft={draft} editableDocumentKeys={editableDocumentKeys} />
  );
}

function ApplicantFields() {
  return (
    <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
      <Text name="firstName" label="First name" required />
      <Text name="middleName" label="Middle name" />
      <Text name="surname" label="Surname" required />
      <Text name="dob" label="Date of birth" type="date" required />
      <Choice name="gender" label="Gender" options={['Male', 'Female']} />
      <Choice
        name="maritalStatus"
        label="Marital status"
        options={['Single', 'Married', 'Divorced', 'Widowed']}
      />
      <Text name="nationality" label="Nationality" required />
      <Text name="stateOfOrigin" label="State of origin" required />
      <Text name="lgaOfOrigin" label="LGA of origin" required />
      <div className="lg:col-span-2">
        <Text name="residentialAddress" label="Residential address" required />
      </div>
      <NumberField name="yearsAtAddress" label="Years at current address" />
      <Phone name="phoneNumber" label="Phone number" required />
      <Phone name="altPhoneNumber" label="Alternative phone" />
      <Form.Item
        label="Email address"
        name="emailAddress"
        rules={[{ required: true }, { type: 'email' }]}
      >
        <Input size="large" />
      </Form.Item>
    </div>
  );
}

function EmploymentFields() {
  return (
    <div className="grid gap-x-5 sm:grid-cols-2">
      <Text name="companyName" label="Company name" required />
      <Text name="companyBranch" label="Branch" required />
      <Text name="positionRank" label="Position / rank" required />
      <Choice
        name="employmentStatus"
        label="Employment status"
        options={['Permanent / Confirmed', 'Contract', 'Self-Employed']}
      />
      <NumberField name="monthlySalary" label="Monthly salary (₦)" />
      <Text
        name="dateOfEmployment"
        label="Date of employment"
        type="date"
        required
      />
      <div className="sm:col-span-2">
        <Text name="workplaceAddress" label="Workplace address" required />
      </div>
    </div>
  );
}

function BankFields() {
  return (
    <>
      <Alert
        showIcon
        type="warning"
        title="A valid 11-digit BVN is required before processing."
      />
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Choice name="bankName" label="Bank name" options={banks} />
        <Text name="accountName" label="Account name" required />
        <Digits name="accountNumber" label="Account number" length={10} />
        <Digits
          name="bvnNumber"
          label="Bank Verification Number (BVN)"
          length={11}
        />
      </div>
    </>
  );
}

function DocumentFields({
  draft,
  editableDocumentKeys,
}: {
  draft: Draft;
  editableDocumentKeys?: string[];
}) {
  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      {uploadFields.map(([name, label, accept]) => (
        <DocumentUploadField
          key={name}
          name={name}
          label={label}
          accept={accept}
          draft={draft}
          disabled={
            editableDocumentKeys !== undefined &&
            !editableDocumentKeys.includes(name)
          }
        />
      ))}
    </div>
  );
}

function DocumentUploadField({
  name,
  label,
  accept,
  draft,
  disabled,
}: {
  name: string;
  label: string;
  accept: string;
  draft: Draft;
  disabled: boolean;
}) {
  const fileList = Form.useWatch(name) as UploadFile[] | undefined;
  const [savedPreviewUrl, setSavedPreviewUrl] = useState('');
  const selectedFile = fileList?.[0]?.originFileObj;
  const savedPath = String(draft[`${name}Path`] ?? '');
  const fileName = selectedFile?.name ?? String(draft[`${name}Name`] ?? '');
  const isImage =
    selectedFile?.type.startsWith('image/') ??
    /\.(jpe?g|png|webp)$/i.test(fileName);
  const selectedPreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  );
  const previewUrl = selectedPreviewUrl || savedPreviewUrl;

  useEffect(() => {
    let active = true;
    if (savedPath) {
      const supabase = getSupabaseBrowserClient();
      void supabase?.storage
        .from('onboarding-documents')
        .createSignedUrl(savedPath, 60 * 60)
        .then(({ data }) => {
          if (active) setSavedPreviewUrl(data?.signedUrl ?? '');
        });
    }

    return () => {
      active = false;
    };
  }, [savedPath]);

  useEffect(
    () => () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    },
    [selectedPreviewUrl],
  );

  return (
    <div>
      <Form.Item
        name={name}
        valuePropName="fileList"
        getValueFromEvent={(event) => event?.fileList}
        rules={[
          {
            required: !savedPath,
            message: `Upload ${label.toLowerCase()}`,
          },
        ]}
      >
        <Upload.Dragger
          beforeUpload={() => false}
          maxCount={1}
          accept={accept}
          disabled={disabled}
          showUploadList={{ showPreviewIcon: false }}
        >
          <CloudUploadOutlined className="text-2xl text-[#236d63]" />
          <p className="mt-2 font-bold text-[#101b36]">{label}</p>
          <p className="text-xs text-[#71809a]">
            {disabled
              ? 'Already accepted — no replacement needed'
              : fileName
                ? `Selected: ${fileName}`
                : 'Click or drag a file here'}
          </p>
        </Upload.Dragger>
      </Form.Item>

      {previewUrl && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-3 rounded-xl border border-[#101b36]/8 bg-[#f7f8fb] p-3 text-sm font-bold text-[#173a76]"
        >
          {isImage ? (
            <Image
              src={previewUrl}
              alt={`${label} preview`}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-white text-xl text-[#236d63]">
              <EyeOutlined />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{fileName}</span>
          <span className="text-xs">Preview</span>
        </a>
      )}
    </div>
  );
}

function Text({
  name,
  label,
  required = false,
  type,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={
        required
          ? [{ required: true, message: `Enter ${label.toLowerCase()}` }]
          : []
      }
    >
      <Input size="large" type={type} />
    </Form.Item>
  );
}

function Choice({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: `Select ${label.toLowerCase()}` }]}
    >
      <Select
        size="large"
        placeholder={`Select ${label.toLowerCase()}`}
        options={options.map((value) => ({ value, label: value }))}
      />
    </Form.Item>
  );
}

function NumberField({
  name,
  label,
  min = 0,
}: {
  name: string;
  label: string;
  min?: number;
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: `Enter ${label.toLowerCase()}` }]}
    >
      <InputNumber className="!w-full" size="large" min={min} />
    </Form.Item>
  );
}

function Phone({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        { required },
        { pattern: /^\d{11}$/, message: 'Enter 11 digits' },
      ]}
    >
      <Input size="large" inputMode="numeric" maxLength={11} />
    </Form.Item>
  );
}

function Digits({
  name,
  label,
  length,
  required = true,
}: {
  name: string;
  label: string;
  length: number;
  required?: boolean;
}) {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        { required },
        {
          pattern: new RegExp(`^\\d{${length}}$`),
          message: `Enter ${length} digits`,
        },
      ]}
    >
      <Input size="large" inputMode="numeric" maxLength={length} />
    </Form.Item>
  );
}

async function uploadDocuments(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  userId: string,
  values: Draft,
) {
  for (const [field] of uploadFields) {
    const files = values[field] as UploadFile[] | undefined;
    const file = files?.[0]?.originFileObj;
    if (!file) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const path = `${userId}/${field}-${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from('onboarding-documents')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    values[`${field}Path`] = path;
    values[`${field}Name`] = file.name;
  }
}

function readableError(message: string) {
  if (message.includes('loan_applications'))
    return 'Run supabase/schema.sql in your Supabase SQL Editor first.';
  return message;
}

function normalizeOnboardingProgress(
  currentStep: number,
  completedSteps: number[],
  saved: Draft,
) {
  const isLegacyFlow =
    completedSteps.some((completedStep) => completedStep > 3) ||
    'loanAmount' in saved;

  if (!isLegacyFlow) {
    return {
      currentStep: Math.min(currentStep, steps.length - 1),
      completedSteps: completedSteps.filter(
        (completedStep) => completedStep < steps.length,
      ),
    };
  }

  const legacyStepMap = new Map([
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 3],
  ]);

  return {
    currentStep: currentStep >= 3 ? 3 : currentStep,
    completedSteps: Array.from(
      new Set(
        completedSteps
          .map((completedStep) => legacyStepMap.get(completedStep))
          .filter((completedStep): completedStep is number =>
            Number.isInteger(completedStep),
          ),
      ),
    ).sort(),
  };
}
