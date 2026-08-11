import { corsHeaders } from '../_shared/cors.ts';
import { SELFIE_BUCKET } from '../_shared/constants.ts';
import { assertOwnerUser } from '../_shared/ownerAuth.ts';
import {
  getSelfieObjectPath,
  isSafeSelfieObjectPath,
} from '../_shared/selfiePath.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const MEMBER_COLUMNS =
  'id, full_name, phone_number, email, gender, date_of_birth, address, selfie_url, plan_type, plan_duration_days, plan_start_date, paid_duration_months, current_period_end, plan_amount, payment_status, notes, created_at, updated_at';

type MissingReason = 'no_selfie' | 'unsafe_path' | 'storage_object_missing';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

/** Flat bucket keys only — metadata/existence, no object byte download. */
const listSelfieObjectKeys = async (
  admin: SupabaseClient,
): Promise<Set<string>> => {
  const keys = new Set<string>();
  const pageSize = 1000;
  let offset = 0;

  for (;;) {
    const { data, error } = await admin.storage
      .from(SELFIE_BUCKET)
      .list('', { limit: pageSize, offset });

    if (error) {
      throw error;
    }

    if (!data?.length) {
      break;
    }

    for (const object of data) {
      if (object?.name) {
        keys.add(object.name);
      }
    }

    if (data.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return keys;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ ok: false, error: 'Unauthorized.', code: 'unauthorized' }, 401);
  }

  try {
    const userClient = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      return json(
        { ok: false, error: 'Unauthorized.', code: 'unauthorized' },
        401,
      );
    }

    const ownerCheck = assertOwnerUser(user.id);
    if (!ownerCheck.ok) {
      return json(
        { ok: false, error: 'Forbidden.', code: 'forbidden' },
        403,
      );
    }

    const admin = createServiceClient();

    const { data: rows, error: fetchError } = await admin
      .from('members')
      .select(MEMBER_COLUMNS)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      return json(
        {
          ok: false,
          error: "Couldn't export members. Please try again.",
          code: 'fetch_failed',
        },
        502,
      );
    }

    const members = rows || [];

    let objectKeys: Set<string>;
    try {
      objectKeys = await listSelfieObjectKeys(admin);
    } catch (storageError) {
      console.error(storageError);
      return json(
        {
          ok: false,
          error: "Couldn't export members. Please try again.",
          code: 'storage_list_failed',
        },
        502,
      );
    }

    const generatedAt = new Date().toISOString();
    const exportMembers: Record<string, unknown>[] = [];
    const missingSelfies: { member_id: string; reason: MissingReason }[] = [];
    let selfiesAvailable = 0;
    let selfieExpected = 0;

    for (const row of members) {
      const memberId = String(row.id);
      const selfieUrl = row.selfie_url as string | null;
      let selfieExportFile = '';
      let selfieAvailable = false;
      let missingReason: MissingReason | null = null;

      if (!selfieUrl || !String(selfieUrl).trim()) {
        missingReason = 'no_selfie';
      } else {
        const path = getSelfieObjectPath(selfieUrl);
        if (!path || !isSafeSelfieObjectPath(path)) {
          missingReason = 'unsafe_path';
        } else {
          selfieExpected += 1;
          selfieExportFile = `selfies/${memberId}.jpg`;

          if (!objectKeys.has(path)) {
            missingReason = 'storage_object_missing';
          } else {
            selfieAvailable = true;
            selfiesAvailable += 1;
          }
        }
      }

      if (missingReason) {
        missingSelfies.push({ member_id: memberId, reason: missingReason });
      }

      exportMembers.push({
        ...row,
        selfie_export_file: selfieExportFile,
        selfie_available: selfieAvailable,
      });
    }

    const selfiesMissing = members.length - selfiesAvailable;

    return json({
      ok: true,
      version: 1,
      generated_at: generatedAt,
      summary: {
        members: members.length,
        selfies_available: selfiesAvailable,
        selfies_missing: selfiesMissing,
      },
      members: exportMembers,
      manifest: {
        version: 1,
        generated_at: generatedAt,
        member_count: members.length,
        selfie_expected: selfieExpected,
        selfie_available: selfiesAvailable,
        selfie_missing: missingSelfies.length,
        missing_selfies: missingSelfies,
      },
    });
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        error: "Couldn't export members. Please try again.",
        code: 'unexpected_error',
      },
      500,
    );
  }
});
