create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  role text not null default 'borrower' check (role in ('borrower', 'super-admin', 'staff', 'credit-officer', 'manager', 'accountant', 'auditor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists email text not null default '';

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('borrower', 'super-admin', 'staff', 'credit-officer', 'manager', 'accountant', 'auditor'));

alter table public.profiles enable row level security;

create table if not exists public.staff_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('super-admin', 'staff', 'credit-officer', 'manager', 'accountant', 'auditor')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.staff_members (user_id, role)
select id, role
from public.profiles
where role in ('super-admin', 'staff', 'credit-officer', 'manager', 'accountant', 'auditor')
on conflict (user_id) do update set role = excluded.role;

alter table public.staff_members enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members
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
    select 1 from public.staff_members
    where user_id = auth.uid() and role in ('manager', 'super-admin')
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

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_staff());

drop policy if exists "Users can update their profile" on public.profiles;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  current_step integer not null default 0 check (current_step between 0 and 3),
  completed_steps integer[] not null default '{}',
  onboarding_data jsonb not null default '{}'::jsonb,
  document_verification jsonb not null default '{}'::jsonb,
  onboarding_status text not null default 'draft' check (onboarding_status in ('draft', 'complete', 'action_required', 'review_pending')),
  onboarding_completed_at timestamptz,
  registration_source text not null default 'online' check (registration_source in ('online', 'staff')),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
add column if not exists document_verification jsonb not null default '{}'::jsonb;

alter table public.customers
drop constraint if exists customers_onboarding_status_check;

alter table public.customers
add constraint customers_onboarding_status_check
check (
  onboarding_status in ('draft', 'complete', 'action_required', 'review_pending')
);

alter table public.customers enable row level security;

drop policy if exists "Customers can read their record" on public.customers;
create policy "Customers can read their record"
on public.customers for select
to authenticated
using (auth_user_id = auth.uid() or public.is_staff());

drop policy if exists "Customers can update their record" on public.customers;
create policy "Customers can update their record"
on public.customers for update
to authenticated
using (auth_user_id = auth.uid() or public.is_staff())
with check (auth_user_id = auth.uid() or public.is_staff());

drop policy if exists "Staff can create customers" on public.customers;
create policy "Staff can create customers"
on public.customers for insert
to authenticated
with check (
  public.is_staff()
  and registration_source = 'staff'
  and added_by = auth.uid()
);

create or replace function public.handle_jesse_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'account_type', 'borrower') <> 'staff' then
    insert into public.customers (
      auth_user_id,
      first_name,
      last_name,
      email,
      phone,
      registration_source
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'first_name', ''),
      coalesce(new.raw_user_meta_data ->> 'last_name', ''),
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      'online'
    )
    on conflict (auth_user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_jesse on auth.users;
create trigger on_auth_user_created_jesse
after insert on auth.users
for each row execute function public.handle_jesse_new_user();

insert into public.profiles (id, first_name, last_name, email)
select
  id,
  coalesce(raw_user_meta_data ->> 'first_name', ''),
  coalesce(raw_user_meta_data ->> 'last_name', ''),
  coalesce(email, '')
from auth.users
where true
on conflict (id) do update set email = excluded.email;

insert into public.customers (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  registration_source
)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'first_name', ''),
  coalesce(users.raw_user_meta_data ->> 'last_name', ''),
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data ->> 'phone', ''),
  'online'
from auth.users as users
where coalesce(users.raw_user_meta_data ->> 'account_type', 'borrower') <> 'staff'
on conflict (auth_user_id) do nothing;

update public.profiles
set role = 'borrower'
where role <> 'borrower';

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

drop policy if exists "Staff can read activity logs" on public.activity_logs;
create policy "Staff can read activity logs"
on public.activity_logs for select
to authenticated
using (public.is_staff());

drop policy if exists "Staff can create activity logs" on public.activity_logs;
create policy "Staff can create activity logs"
on public.activity_logs for insert
to authenticated
with check (public.is_staff() and actor_id = auth.uid());

create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_step integer not null default 0 check (current_step between 0 and 6),
  completed_steps integer[] not null default '{}',
  form_data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'declined')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loan_applications enable row level security;

drop policy if exists "Borrowers can read their application" on public.loan_applications;
create policy "Borrowers can read their application"
on public.loan_applications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Borrowers can create their application" on public.loan_applications;
create policy "Borrowers can create their application"
on public.loan_applications for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Borrowers can update their application" on public.loan_applications;
create policy "Borrowers can update their application"
on public.loan_applications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Staff can read onboarding records" on public.loan_applications;
create policy "Staff can read onboarding records"
on public.loan_applications for select
to authenticated
using (public.is_staff());

update public.customers as customer
set
  onboarding_data = customer.onboarding_data || application.form_data,
  onboarding_status = case
    when application.status = 'draft' then customer.onboarding_status
    when customer.onboarding_status = 'complete' then 'complete'
    else 'review_pending'
  end,
  completed_steps = case
    when application.status = 'draft' then customer.completed_steps
    else array[0, 1, 2, 3]
  end,
  onboarding_completed_at = case
    when application.status = 'draft' then customer.onboarding_completed_at
    else coalesce(customer.onboarding_completed_at, application.submitted_at)
  end,
  updated_at = now()
from public.loan_applications as application
where customer.auth_user_id = application.user_id;

update public.customers
set onboarding_status = 'review_pending'
where onboarding_status = 'complete'
  and (
    coalesce(document_verification -> 'passportFile' ->> 'status', '') <> 'verified'
    or coalesce(document_verification -> 'idCardFile' ->> 'status', '') <> 'verified'
    or coalesce(document_verification -> 'utilityFile' ->> 'status', '') <> 'verified'
    or coalesce(document_verification -> 'bankStatementFile' ->> 'status', '') <> 'verified'
  );

create table if not exists public.loan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  loan_type text not null default 'Business Loan' check (loan_type in ('Business Loan', 'Weekly Business Loan', 'Employee Loan', 'Special Loan')),
  purpose text not null,
  amount numeric(14, 2) not null check (amount >= 1000),
  duration text not null,
  repayment_frequency text not null check (repayment_frequency in ('Weekly', 'Monthly')),
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loan_requests
add column if not exists loan_type text not null default 'Business Loan';

alter table public.loan_requests
add column if not exists customer_id uuid references public.customers(id) on delete cascade;

alter table public.loan_requests
alter column user_id drop not null;

update public.loan_requests as request
set customer_id = customer.id
from public.customers as customer
where request.customer_id is null
  and request.user_id = customer.auth_user_id;

alter table public.loan_requests
drop constraint if exists loan_requests_customer_check;

alter table public.loan_requests
add constraint loan_requests_customer_check
check (user_id is not null or customer_id is not null);

alter table public.loan_requests enable row level security;

drop policy if exists "Borrowers can read their loan requests" on public.loan_requests;
create policy "Borrowers can read their loan requests"
on public.loan_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Borrowers can submit loan requests" on public.loan_requests;
create policy "Borrowers can submit loan requests"
on public.loan_requests for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    customer_id is null
    or exists (
      select 1 from public.customers
      where id = customer_id and auth_user_id = auth.uid()
    )
  )
);

drop policy if exists "Staff can submit customer loan requests" on public.loan_requests;
create policy "Staff can submit customer loan requests"
on public.loan_requests for insert
to authenticated
with check (public.is_staff() and customer_id is not null);

drop policy if exists "Staff can read loan requests" on public.loan_requests;
create policy "Staff can read loan requests"
on public.loan_requests for select
to authenticated
using (public.is_staff());

insert into storage.buckets (id, name, public)
values ('onboarding-documents', 'onboarding-documents', false)
on conflict (id) do nothing;

drop policy if exists "Borrowers can upload their documents" on storage.objects;
create policy "Borrowers can upload their documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'onboarding-documents'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists "Borrowers can read their documents" on storage.objects;
create policy "Borrowers can read their documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and (
    name like (auth.uid()::text || '/%')
    or public.is_staff()
  )
);

drop policy if exists "Borrowers can update their documents" on storage.objects;
create policy "Borrowers can update their documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and name like (auth.uid()::text || '/%')
);
