'use client';

import { BankOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import Link from './app-link';
import { useEffect, useState } from 'react';
import { getAccountAccess } from '../lib/staff-roles';
import { getSupabaseBrowserClient } from '../lib/supabase';

export function PortalChoice() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');

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
      if (!access.staffRole || !access.hasBorrowerAccess) {
        window.location.replace(access.staffRole ? '/portal' : '/dashboard');
        return;
      }
      setFirstName(String(user.user_metadata.first_name ?? ''));
      setLoading(false);
    });
  }, []);

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.replace('/login');
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f6fb]">
        <Spin size="large" />
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-4 py-10 text-[#101b36]">
      <section className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(16,27,54,0.08)] sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#173a76] text-white">
              JR
            </span>
            Jesse Remedies
          </Link>
          <Button type="text" icon={<LogoutOutlined />} onClick={signOut}>
            Sign out
          </Button>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs font-black tracking-[0.14em] text-[#236d63] uppercase">
            Choose your workspace
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Welcome{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="mt-3 text-[#71809a]">
            This account has borrower and staff access.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <WorkspaceLink
            href="/dashboard"
            icon={<BankOutlined />}
            title="Borrower dashboard"
            description="Manage your onboarding and personal loan requests."
          />
          <WorkspaceLink
            href="/portal"
            icon={<TeamOutlined />}
            title="Staff portal"
            description="Manage customers, documents and staff operations."
          />
        </div>
      </section>
    </main>
  );
}

function WorkspaceLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#101b36]/10 p-6 transition hover:border-[#173a76] hover:bg-[#f7f9fd]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef3fb] text-lg text-[#173a76]">
        {icon}
      </span>
      <strong className="mt-5 block text-lg text-[#101b36]">{title}</strong>
      <span className="mt-2 block text-sm leading-6 text-[#71809a]">
        {description}
      </span>
    </Link>
  );
}
