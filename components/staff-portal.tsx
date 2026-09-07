'use client';

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from './app-link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getAccountAccess, roleLabel } from '../lib/staff-roles';

type Customer = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  onboarding_status:
    'draft' | 'complete' | 'action_required' | 'review_pending';
  registration_source: 'online' | 'staff';
  added_by: string | null;
  added_by_name?: string;
  created_at: string;
};

export function StaffPortal({ page }: { page: 'dashboard' | 'customers' }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [staffName, setStaffName] = useState('Staff');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loanRequests, setLoanRequests] = useState(0);
  const [search, setSearch] = useState('');

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

      const [{ data: profile }, access] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle(),
        getAccountAccess(supabase, user.id),
      ]);
      if (!access.staffRole) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setStaffName(
        `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
          'Staff',
      );
      const [{ data: customerRows }, { count }, { data: onboardingRows }] =
        await Promise.all([
          supabase
            .from('customers')
            .select(
              'id, auth_user_id, first_name, last_name, email, phone, onboarding_status, registration_source, added_by, created_at',
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('loan_requests')
            .select('*', { count: 'exact', head: true }),
          supabase.from('loan_applications').select('user_id, status'),
        ]);

      const rows = (customerRows ?? []) as Customer[];
      const completedOnlineUsers = new Set(
        (onboardingRows ?? [])
          .filter((onboarding) => onboarding.status !== 'draft')
          .map((onboarding) => onboarding.user_id),
      );
      const staffIds = Array.from(
        new Set(rows.map((customer) => customer.added_by).filter(Boolean)),
      ) as string[];
      const staffNames = new Map<string, string>();
      if (staffIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', staffIds);
        for (const member of profiles ?? []) {
          staffNames.set(
            member.id,
            `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim(),
          );
        }
      }

      setCustomers(
        rows.map((customer) => ({
          ...customer,
          onboarding_status:
            customer.auth_user_id &&
            completedOnlineUsers.has(customer.auth_user_id)
              ? 'complete'
              : customer.onboarding_status,
          added_by_name: customer.added_by
            ? staffNames.get(customer.added_by) || 'Staff member'
            : 'Online registration',
        })),
      );
      setLoanRequests(count ?? 0);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      [
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [customers, search]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" description="Loading staff portal..." />
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-5 text-center">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#101b36]">
            Staff access required
          </h1>
          <p className="mt-3 text-[#71809a]">
            This account has not been assigned a staff role.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block font-bold text-[#173a76]"
          >
            Return to borrower dashboard
          </Link>
        </div>
      </main>
    );
  }

  const completed = customers.filter(
    (customer) => customer.onboarding_status === 'complete',
  ).length;
  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, customer) => (
        <div>
          <strong className="block text-[#101b36]">
            {customer.first_name || 'Unnamed'} {customer.last_name}
          </strong>
          <span className="text-xs text-[#71809a]">
            {customer.email || 'No email'}
          </span>
        </div>
      ),
    },
    { title: 'Phone', dataIndex: 'phone', render: (value) => value || '—' },
    {
      title: 'Onboarding',
      dataIndex: 'onboarding_status',
      render: (status: Customer['onboarding_status']) => (
        <Tag color={statusTag(status).color}>{statusTag(status).label}</Tag>
      ),
    },
    {
      title: 'Added by',
      key: 'addedBy',
      render: (_, customer) =>
        customer.registration_source === 'online'
          ? 'Online registration'
          : customer.added_by_name,
    },
    {
      title: '',
      key: 'action',
      render: (_, customer) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/customers/${customer.id}`}
            className="font-bold text-[#173a76]"
          >
            View
          </Link>
          {customer.registration_source === 'staff' &&
            ['draft', 'action_required'].includes(
              customer.onboarding_status,
            ) && (
              <Link
                href={`/portal/customers/new?customer=${customer.id}`}
                className="font-bold text-[#236d63]"
              >
                Continue
              </Link>
            )}
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#101b36] lg:grid lg:grid-cols-[240px_1fr]">
      <StaffSidebar active={page} />

      <div className="flex min-h-screen min-w-0 flex-col">
        <StaffTopbar />
        <div className="flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.14em] text-[#236d63] uppercase">
                {page === 'dashboard'
                  ? 'Operations overview'
                  : 'Customer management'}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                {page === 'dashboard' ? `Welcome, ${staffName}.` : 'Customers'}
              </h1>
            </div>
            <Button
              type="primary"
              href="/portal/customers/new"
              icon={<PlusOutlined />}
              className="!h-11 !w-fit !rounded-xl !border-0 !bg-[#173a76] !px-5 !font-black !text-white !shadow-none"
            >
              Onboard customer
            </Button>
          </header>

          {page === 'dashboard' ? (
            <>
              <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StaffStat
                  icon={<TeamOutlined />}
                  label="Customers"
                  value={customers.length}
                />
                <StaffStat
                  icon={<CheckCircleOutlined />}
                  label="Onboarded"
                  value={completed}
                />
                <StaffStat
                  icon={<ClockCircleOutlined />}
                  label="In progress"
                  value={customers.length - completed}
                />
                <StaffStat
                  icon={<FileTextOutlined />}
                  label="Loan requests"
                  value={loanRequests}
                />
              </section>
              <section className="mt-7 rounded-3xl border border-[#101b36]/8 bg-white p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Recent customers</h2>
                  <Link
                    href="/portal/customers"
                    className="text-sm font-bold text-[#173a76]"
                  >
                    View all <ArrowRightOutlined />
                  </Link>
                </div>
                <Table
                  className="mt-5"
                  rowKey="id"
                  columns={columns.slice(0, 4)}
                  dataSource={customers.slice(0, 5)}
                  pagination={false}
                  scroll={{ x: 720 }}
                />
              </section>
            </>
          ) : (
            <section className="mt-8 rounded-3xl border border-[#101b36]/8 bg-white p-4 sm:p-7">
              <Input
                size="large"
                allowClear
                prefix={<SearchOutlined className="text-[#8a96aa]" />}
                placeholder="Search by name, email or phone"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mb-6 max-w-md"
              />
              <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredCustomers}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                scroll={{ x: 850 }}
              />
            </section>
          )}
        </div>
        <StaffFooter />
      </div>
    </main>
  );
}

export function StaffSidebar({
  active,
}: {
  active: 'dashboard' | 'customers' | 'team' | 'activity';
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [hasBorrowerAccess, setHasBorrowerAccess] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void supabase?.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return;
      const access = await getAccountAccess(supabase, data.session.user.id);
      setHasBorrowerAccess(access.hasBorrowerAccess);
    });
  }, []);

  async function signOut() {
    setSigningOut(true);
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.replace('/login');
  }

  return (
    <aside className="staff-sidebar sticky top-0 z-50 flex min-h-16 flex-row items-center justify-between border-b border-[#101b36]/8 bg-white px-4 py-3 text-[#374151] sm:px-6 lg:static lg:min-h-screen lg:flex-col lg:items-stretch lg:justify-start lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
      <Link
        href="/portal"
        className="flex items-center gap-3 font-black !text-[#374151]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173a76] text-white">
          JR
        </span>
        <span>
          <span className="block">Jesse Remedies</span>
          <span className="mt-0.5 block text-[10px] tracking-[0.14em] !text-[#4b5563] uppercase">
            Staff portal
          </span>
        </span>
      </Link>
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="staff-navigation"
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setMobileOpen((open) => !open)}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[#d8dee9] !text-[#374151] transition hover:bg-[#f3f6fb] lg:hidden"
      >
        <MenuOutlined className="text-lg" />
      </button>
      <nav
        id="staff-navigation"
        className={`${mobileOpen ? 'grid' : 'hidden'} absolute inset-x-0 top-full gap-2 border-b border-[#101b36]/8 bg-white p-4 shadow-lg lg:static lg:mt-6 lg:flex lg:flex-col lg:border-0 lg:p-0 lg:shadow-none`}
      >
        <StaffNavLink
          href="/portal"
          active={active === 'dashboard'}
          icon={<FileTextOutlined />}
        >
          Dashboard
        </StaffNavLink>
        <StaffNavLink
          href="/portal/customers"
          active={active === 'customers'}
          icon={<TeamOutlined />}
        >
          Customers
        </StaffNavLink>
        <StaffNavLink
          href="/portal/team"
          active={active === 'team'}
          icon={<SettingOutlined />}
        >
          Staff & roles
        </StaffNavLink>
        <StaffNavLink
          href="/portal/activity"
          active={active === 'activity'}
          icon={<ClockCircleOutlined />}
        >
          Activity logs
        </StaffNavLink>
        {hasBorrowerAccess && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold !text-[#374151] transition hover:bg-[#f3f6fb] lg:hidden"
          >
            <UserOutlined /> Borrower dashboard
          </Link>
        )}
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void signOut()}
          className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold !text-[#374151] transition hover:bg-[#f3f6fb] disabled:opacity-60 lg:hidden"
        >
          <LogoutOutlined /> {signingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </nav>
    </aside>
  );
}

function StaffNavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
        active
          ? '!bg-[#173a76] !text-white shadow-sm [&_*]:!text-white'
          : 'bg-transparent !text-[#374151] hover:bg-[#f3f6fb] hover:!text-[#1f2937] [&_*]:!text-[#374151] hover:[&_*]:!text-[#1f2937]'
      }`}
    >
      {icon} {children}
    </Link>
  );
}

export function StaffTopbar() {
  const [profile, setProfile] = useState({
    name: 'Staff member',
    email: '',
    role: 'Staff',
    hasBorrowerAccess: false,
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void supabase?.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const [{ data: staff }, access] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .maybeSingle(),
        getAccountAccess(supabase, user.id),
      ]);
      setProfile({
        name:
          `${staff?.first_name ?? ''} ${staff?.last_name ?? ''}`.trim() ||
          'Staff member',
        email: staff?.email || user.email || '',
        role: access.staffRole ? roleLabel(access.staffRole) : 'Staff',
        hasBorrowerAccess: access.hasBorrowerAccess,
      });
    });
  }, []);

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  async function handleMenu({ key }: { key: string }) {
    if (key !== 'signout') return;
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.replace('/login');
  }

  return (
    <header className="hidden h-20 min-w-0 shrink-0 items-center justify-end border-b border-[#101b36]/8 bg-white px-10 lg:flex">
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          onClick: (info) => void handleMenu(info),
          items: [
            {
              key: 'profile',
              icon: <UserOutlined />,
              disabled: true,
              label: (
                <div className="min-w-48 py-1">
                  <p className="text-xs font-bold text-[#71809a] uppercase">
                    Profile
                  </p>
                  <p className="mt-1 font-black text-[#1f2937]">
                    {profile.name}
                  </p>
                  <p className="text-xs text-[#71809a]">{profile.email}</p>
                  <Tag className="mt-2">{profile.role}</Tag>
                </div>
              ),
            },
            ...(profile.hasBorrowerAccess
              ? [
                  {
                    key: 'borrower-dashboard',
                    icon: <UserOutlined />,
                    label: <Link href="/dashboard">Borrower dashboard</Link>,
                  },
                ]
              : []),
            { type: 'divider' },
            {
              key: 'signout',
              icon: <LogoutOutlined />,
              label: 'Sign out',
              danger: true,
            },
          ],
        }}
      >
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#f3f6fb] sm:gap-3"
        >
          <Avatar className="!bg-[#173a76] !font-black !text-white">
            {initials || 'S'}
          </Avatar>
          <span className="hidden sm:block">
            <strong className="block text-sm text-[#374151]">
              {profile.name}
            </strong>
            <span className="block text-xs text-[#6b7280]">{profile.role}</span>
          </span>
          <DownOutlined className="text-xs text-[#6b7280]" />
        </button>
      </Dropdown>
    </header>
  );
}

export function StaffFooter() {
  return (
    <footer className="border-t border-[#101b36]/8 bg-white px-5 py-4 text-center text-xs text-[#6b7280]">
      Powered by{' '}
      <strong className="text-[#374151]">AltraMorph Technologies</strong>
    </footer>
  );
}

function StaffStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-3xl border border-[#101b36]/8 bg-white p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f4] text-[#236d63]">
        {icon}
      </span>
      <p className="mt-5 text-xs font-bold tracking-[0.1em] text-[#71809a] uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}

function statusTag(status: Customer['onboarding_status']) {
  if (status === 'complete') return { label: 'Onboarded', color: 'green' };
  if (status === 'action_required')
    return { label: 'Action required', color: 'red' };
  if (status === 'review_pending')
    return { label: 'Review pending', color: 'blue' };
  return { label: 'In progress', color: 'gold' };
}
