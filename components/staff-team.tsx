'use client';

import { PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import {
  getAccountAccess,
  roleLabel,
  staffRoleOptions,
  type StaffRole,
} from '../lib/staff-roles';
import { StaffFooter, StaffSidebar, StaffTopbar } from './staff-portal';

type StaffMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: StaffRole;
  created_at: string;
};

type StaffForm = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: StaffRole;
};

export function StaffTeam() {
  const [form] = Form.useForm<StaffForm>();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
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
      const access = await getAccountAccess(supabase, user.id);
      if (
        !access.staffRole ||
        !['manager', 'super-admin'].includes(access.staffRole)
      ) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      const { data: memberships } = await supabase
        .from('staff_members')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: false });
      const staffIds = (memberships ?? []).map((member) => member.user_id);
      const { data: profiles } = staffIds.length
        ? await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', staffIds)
        : { data: [] };
      const profileMap = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile]),
      );
      setMembers(
        (memberships ?? []).flatMap((membership) => {
          const profile = profileMap.get(membership.user_id);
          return profile
            ? [
                {
                  ...profile,
                  role: membership.role as StaffRole,
                  created_at: membership.created_at,
                },
              ]
            : [];
        }),
      );
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) =>
      `${member.first_name} ${member.last_name} ${member.email} ${member.role}`
        .toLowerCase()
        .includes(query),
    );
  }, [members, search]);

  async function createStaff(values: StaffForm) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true);
    setNotice(null);
    const { data, error } = await supabase.functions.invoke('create-staff', {
      body: values,
    });
    setSaving(false);
    if (error || data?.error) {
      setNotice({
        type: 'error',
        text:
          data?.error ?? error?.message ?? 'Could not create staff account.',
      });
      return;
    }
    setMembers((current) => [data.profile as StaffMember, ...current]);
    setNotice({
      type: 'success',
      text: data.existingAccount
        ? 'Staff access granted to the existing account.'
        : 'Staff account created successfully.',
    });
    form.resetFields();
    setOpen(false);
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" />
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#f3f6fb] text-[#101b36] lg:grid lg:grid-cols-[240px_1fr]">
        <StaffSidebar active="team" />
        <div className="grid place-items-center p-6">
          <Alert
            type="warning"
            showIcon
            title="Manager access required"
            description="Only managers and super admins can create and manage staff accounts."
          />
        </div>
      </main>
    );
  }

  const columns: ColumnsType<StaffMember> = [
    {
      title: 'Staff member',
      render: (_, member) => (
        <div>
          <strong className="block">
            {member.first_name} {member.last_name}
          </strong>
          <span className="text-xs text-[#71809a]">{member.email}</span>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role: string) => <Tag color="blue">{roleLabel(role)}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      render: (date: string) =>
        new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(
          new Date(date),
        ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#101b36] lg:grid lg:grid-cols-[240px_1fr]">
      <StaffSidebar active="team" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <StaffTopbar />
        <div className="flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.14em] text-[#236d63] uppercase">
                Access management
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Staff & roles
              </h1>
              <p className="mt-2 text-sm text-[#71809a]">
                Create staff accounts or grant access to an existing borrower.
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setNotice(null);
                setOpen(true);
              }}
              className="!h-11 !rounded-xl !border-0 !bg-[#173a76] !px-5 !font-black !text-white !shadow-none"
            >
              Create staff
            </Button>
          </header>

          {notice && <Alert showIcon type={notice.type} title={notice.text} />}

          <section className="mt-8 rounded-3xl border border-[#101b36]/8 bg-white p-4 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef7f4] text-[#236d63]">
                <TeamOutlined />
              </span>
              <Input
                size="large"
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search staff or role"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="max-w-md"
              />
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              scroll={{ x: 620 }}
            />
          </section>
        </div>
        <StaffFooter />
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title="Create or grant staff access"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className="mt-5"
          onFinish={(values) => void createStaff(values)}
        >
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="firstName"
              label="First name"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last name"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>
          </div>
          <Form.Item
            name="email"
            label="Email address"
            rules={[{ required: true }, { type: 'email' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Temporary password (new accounts only)"
            extra="Leave blank when granting staff access to an existing borrower."
            rules={[{ min: 8 }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select size="large" options={[...staffRoleOptions]} />
          </Form.Item>
          <div className="flex justify-end gap-3 border-t border-[#101b36]/8 pt-5">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className="!border-0 !bg-[#173a76] !font-bold !text-white"
            >
              Create staff
            </Button>
          </div>
        </Form>
      </Modal>
    </main>
  );
}
