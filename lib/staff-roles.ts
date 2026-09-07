import type { SupabaseClient } from '@supabase/supabase-js';

export const staffRoleOptions = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'credit-officer', label: 'Credit Officer' },
  { value: 'manager', label: 'Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'auditor', label: 'Auditor' },
] as const;

export type StaffRole = (typeof staffRoleOptions)[number]['value'];

export function isStaffRole(role?: string | null): role is StaffRole {
  return staffRoleOptions.some((option) => option.value === role);
}

export function roleLabel(role: string) {
  return (
    staffRoleOptions.find((option) => option.value === role)?.label ?? role
  );
}

export async function getAccountAccess(
  supabase: SupabaseClient,
  userId: string,
) {
  const [{ data: staff }, { data: customer }] = await Promise.all([
    supabase
      .from('staff_members')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle(),
  ]);

  return {
    staffRole: isStaffRole(staff?.role) ? staff.role : null,
    hasBorrowerAccess: Boolean(customer),
  };
}
