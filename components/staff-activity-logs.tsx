'use client';

import { ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Input, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getAccountAccess } from '../lib/staff-roles';
import { StaffFooter, StaffSidebar, StaffTopbar } from './staff-portal';

type ActivityLog = {
  id: string;
  actor_id: string | null;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export function StaffActivityLogs() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');

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

      const { data: rows } = await supabase
        .from('activity_logs')
        .select(
          'id, actor_id, action, entity_type, entity_id, details, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(500);
      const typedRows = (rows ?? []) as ActivityLog[];
      const actorIds = Array.from(
        new Set(typedRows.map((log) => log.actor_id).filter(Boolean)),
      ) as string[];
      const names = new Map<string, string>();
      if (actorIds.length) {
        const { data: actors } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', actorIds);
        for (const actor of actors ?? []) {
          names.set(
            actor.id,
            `${actor.first_name ?? ''} ${actor.last_name ?? ''}`.trim(),
          );
        }
      }
      setLogs(
        typedRows.map((log) => ({
          ...log,
          actor_name: log.actor_id
            ? names.get(log.actor_id) || 'Staff member'
            : 'System',
        })),
      );
      setLoading(false);
    });
  }, []);

  const actions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action))),
    [logs],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesAction = action === 'all' || log.action === action;
      const haystack =
        `${log.actor_name} ${log.action} ${log.entity_type} ${JSON.stringify(log.details)}`.toLowerCase();
      return matchesAction && (!query || haystack.includes(query));
    });
  }, [action, logs, search]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" />
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-5">
        <Alert showIcon type="warning" title="Staff access required" />
      </main>
    );
  }

  const columns: ColumnsType<ActivityLog> = [
    {
      title: 'Date and time',
      dataIndex: 'created_at',
      render: (date: string) =>
        new Intl.DateTimeFormat('en-NG', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(date)),
    },
    { title: 'Staff member', dataIndex: 'actor_name' },
    {
      title: 'Activity',
      dataIndex: 'action',
      render: (value: string) => <strong>{formatAction(value)}</strong>,
    },
    {
      title: 'Record',
      dataIndex: 'entity_type',
      render: (value: string) => <Tag>{formatAction(value)}</Tag>,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      render: (details: Record<string, unknown>) => detailText(details),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#101b36] lg:grid lg:grid-cols-[240px_1fr]">
      <StaffSidebar active="activity" />
      <div className="flex min-h-screen min-w-0 flex-col">
        <StaffTopbar />
        <div className="flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <header>
            <p className="text-xs font-black tracking-[0.14em] text-[#236d63] uppercase">
              Audit trail
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Activity logs
            </h1>
            <p className="mt-2 text-sm text-[#71809a]">
              Review important staff actions across the platform.
            </p>
          </header>
          <section className="mt-8 rounded-3xl border border-[#101b36]/8 bg-white p-4 sm:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <Input
                size="large"
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search activity"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="max-w-md"
              />
              <Select
                size="large"
                value={action}
                onChange={setAction}
                className="min-w-52"
                options={[
                  { value: 'all', label: 'All activities' },
                  ...actions.map((value) => ({
                    value,
                    label: formatAction(value),
                  })),
                ]}
              />
            </div>
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#71809a]">
              <ClockCircleOutlined /> {filtered.length} recorded activities
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 15, hideOnSinglePage: true }}
              scroll={{ x: 900 }}
            />
          </section>
        </div>
        <StaffFooter />
      </div>
    </main>
  );
}

function formatAction(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function detailText(details: Record<string, unknown>) {
  const values = Object.entries(details)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(([key, value]) => `${formatAction(key)}: ${String(value)}`);
  return values.join(' · ') || '—';
}
