/**
 * Owner allowlist for privileged Edge Functions.
 * Set Edge Function secret OWNER_USER_IDS to a comma-separated list of
 * Supabase Auth user UUIDs (the gym owner account(s)).
 * Never hardcode owner emails/UUIDs in source.
 */
export const assertOwnerUser = (
  userId: string | undefined | null,
): { ok: true } | { ok: false; code: 'forbidden' | 'misconfigured' } => {
  if (!userId) {
    return { ok: false, code: 'forbidden' };
  }

  const raw = String(Deno.env.get('OWNER_USER_IDS') || '');
  const allowed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    console.error(
      'OWNER_USER_IDS is missing or empty — delete-member refuses all callers (fail closed).',
    );
    return { ok: false, code: 'misconfigured' };
  }

  if (!allowed.includes(userId)) {
    return { ok: false, code: 'forbidden' };
  }

  return { ok: true };
};
