-- Run this migration once in the Supabase SQL editor.
-- It is safe to run again.

create table if not exists public.staff_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (
    role in (
      'super-admin',
      'staff',
      'credit-officer',
      'manager',
      'accountant',
      'auditor'
    )
  ),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.staff_members (user_id, role)
select id, role
from public.profiles
where role in (
  'super-admin',
  'staff',
  'credit-officer',
  'manager',
  'accountant',
  'auditor'
)
on conflict (user_id) do update
set role = excluded.role,
    updated_at = now();

alter table public.staff_members enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_members
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_staff() to authenticated;

create or replace function public.can_manage_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_members
    where user_id = auth.uid()
      and role in ('manager', 'super-admin')
  );
$$;

grant execute on function public.can_manage_staff() to authenticated;

drop policy if exists "Staff can read staff memberships" on public.staff_members;
create policy "Staff can read staff memberships"
on public.staff_members for select
to authenticated
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "Managers can create staff memberships" on public.staff_members;
create policy "Managers can create staff memberships"
on public.staff_members for insert
to authenticated
with check (public.can_manage_staff());

drop policy if exists "Managers can update staff memberships" on public.staff_members;
create policy "Managers can update staff memberships"
on public.staff_members for update
to authenticated
using (public.can_manage_staff())
with check (public.can_manage_staff());

drop policy if exists "Managers can remove staff memberships" on public.staff_members;
create policy "Managers can remove staff memberships"
on public.staff_members for delete
to authenticated
using (public.can_manage_staff());

update public.profiles
set role = 'borrower'
where role <> 'borrower';
