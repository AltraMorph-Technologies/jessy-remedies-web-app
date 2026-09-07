import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const allowedRoles = [
  'super-admin',
  'staff',
  'credit-officer',
  'manager',
  'accountant',
  'auditor',
];

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return response({ error: 'Unauthorized.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return response({ error: 'Staff creation is not configured.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = authorization.replace('Bearer ', '');
    const { data: authData, error: authError } =
      await admin.auth.getUser(token);
    if (authError || !authData.user)
      return response({ error: 'Unauthorized.' }, 401);

    const { data: caller } = await admin
      .from('staff_members')
      .select('role')
      .eq('user_id', authData.user.id)
      .single();
    if (!['manager', 'super-admin'].includes(caller?.role ?? '')) {
      return response(
        { error: 'Only managers and super admins can create staff accounts.' },
        403,
      );
    }

    const body = await request.json();
    const firstName = String(body.firstName ?? '').trim();
    const lastName = String(body.lastName ?? '').trim();
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    const role = String(body.role ?? '');
    if (!firstName || !lastName || !email || !allowedRoles.includes(role)) {
      return response(
        {
          error: 'Enter valid staff details and select a staff role.',
        },
        400,
      );
    }

    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    let staffUserId = existingProfile?.id ?? '';
    let createdNewUser = false;
    if (!staffUserId) {
      if (password.length < 8) {
        return response(
          {
            error:
              'A password of at least 8 characters is required for a new account.',
          },
          400,
        );
      }
      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            account_type: 'staff',
          },
        });
      if (createError || !created.user) {
        return response(
          { error: createError?.message ?? 'Could not create staff account.' },
          400,
        );
      }
      staffUserId = created.user.id;
      createdNewUser = true;
    }

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffUserId)
      .select('id, first_name, last_name, email')
      .single();
    if (profileError) {
      if (createdNewUser) await admin.auth.admin.deleteUser(staffUserId);
      return response({ error: profileError.message }, 400);
    }

    const { data: membership, error: membershipError } = await admin
      .from('staff_members')
      .upsert(
        {
          user_id: staffUserId,
          role,
          created_by: authData.user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('role, created_at')
      .single();
    if (membershipError) {
      if (createdNewUser) await admin.auth.admin.deleteUser(staffUserId);
      return response({ error: membershipError.message }, 400);
    }

    await admin.from('activity_logs').insert({
      actor_id: authData.user.id,
      action: createdNewUser ? 'staff_created' : 'staff_access_granted',
      entity_type: 'staff',
      entity_id: staffUserId,
      details: { role, email, name: `${firstName} ${lastName}` },
    });

    return response({
      profile: {
        ...profile,
        role: membership.role,
        created_at: membership.created_at,
      },
      existingAccount: !createdNewUser,
    });
  } catch {
    return response({ error: 'Could not create staff account.' }, 500);
  }
});

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
