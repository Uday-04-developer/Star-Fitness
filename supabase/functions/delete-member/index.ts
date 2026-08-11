import { corsHeaders } from '../_shared/cors.ts';
import { SELFIE_BUCKET } from '../_shared/constants.ts';
import { assertOwnerUser } from '../_shared/ownerAuth.ts';
import {
  getSelfieObjectPath,
  isSafeSelfieObjectPath,
} from '../_shared/selfiePath.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';
import { isUuid } from '../_shared/validation.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

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

    let body: { memberId?: unknown };
    try {
      body = await req.json();
    } catch {
      return json(
        { ok: false, error: 'Invalid request body.', code: 'invalid_body' },
        400,
      );
    }

    // Ignore any client-supplied selfie_url — path comes from the DB row only.
    const memberId = body?.memberId;
    if (!isUuid(memberId)) {
      return json(
        { ok: false, error: 'Invalid member id.', code: 'invalid_member_id' },
        400,
      );
    }

    const admin = createServiceClient();

    const { data: member, error: fetchError } = await admin
      .from('members')
      .select('id, selfie_url')
      .eq('id', memberId)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      return json(
        {
          ok: false,
          error: "Couldn't delete this member. Please try again.",
          code: 'fetch_failed',
        },
        502,
      );
    }

    if (!member) {
      return json(
        { ok: false, error: 'Member not found.', code: 'not_found' },
        404,
      );
    }

    const selfiePathSource = member.selfie_url as string | null;

    // DB first — prefer orphan Storage object over a live member without photo.
    const { error: deleteError } = await admin
      .from('members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error(deleteError);
      return json(
        {
          ok: false,
          error: "Couldn't delete this member. Please try again.",
          code: 'delete_failed',
        },
        502,
      );
    }

    const path = getSelfieObjectPath(selfiePathSource);
    if (path && isSafeSelfieObjectPath(path)) {
      const { error: storageError } = await admin.storage
        .from(SELFIE_BUCKET)
        .remove([path]);

      if (storageError) {
        console.error(
          'Member deleted but selfie Storage cleanup failed (possible orphan):',
          { path, storageError },
        );
      }
    } else if (selfiePathSource) {
      console.error(
        'Member deleted; skipped Storage cleanup due to unsafe/unusable selfie path:',
        selfiePathSource,
      );
    }

    return json({ ok: true, memberId });
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        error: "Couldn't delete this member. Please try again.",
        code: 'unexpected_error',
      },
      500,
    );
  }
});
