import { corsHeaders } from '../_shared/cors.ts';
import {
  MAX_REQUEST_BYTES,
  MAX_SELFIE_BYTES,
  SELFIE_BUCKET,
} from '../_shared/constants.ts';
import { addCalendarMonths } from '../_shared/dates.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { buildValidatedRegistration } from '../_shared/validation.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const isJpegBytes = (bytes: Uint8Array) =>
  bytes.length >= 3 &&
  bytes[0] === 0xff &&
  bytes[1] === 0xd8 &&
  bytes[2] === 0xff;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json(
      {
        ok: false,
        error: 'Request is too large. Use a smaller selfie photo.',
        code: 'payload_too_large',
      },
      413,
    );
  }

  let uploadedPath: string | null = null;
  let admin;

  try {
    admin = createServiceClient();
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        error:
          "Couldn't reach the database. Ask the gym owner to check Supabase configuration.",
      },
      500,
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return json(
        {
          ok: false,
          error: 'Send registration data as multipart form data with a selfie.',
          code: 'invalid_content_type',
        },
        400,
      );
    }

    const form = await req.formData();
    const selfie = form.get('selfie');

    if (!(selfie instanceof File)) {
      return json(
        {
          ok: false,
          error: 'A selfie is required. Turn on the camera and capture your photo.',
          code: 'selfie_required',
        },
        400,
      );
    }

    if (selfie.size <= 0 || selfie.size > MAX_SELFIE_BYTES) {
      return json(
        {
          ok: false,
          error: 'Selfie must be a JPEG under 2 MB.',
          code: 'selfie_too_large',
        },
        400,
      );
    }

    const mime = String(selfie.type || '').toLowerCase();
    if (mime && mime !== 'image/jpeg' && mime !== 'image/jpg') {
      return json(
        {
          ok: false,
          error: 'Selfie must be a JPEG image.',
          code: 'invalid_file_type',
        },
        400,
      );
    }

    const bytes = new Uint8Array(await selfie.arrayBuffer());
    if (!isJpegBytes(bytes)) {
      return json(
        {
          ok: false,
          error: 'Selfie must be a JPEG image.',
          code: 'invalid_file_type',
        },
        400,
      );
    }

    const fields: Record<string, unknown> = {};
    for (const key of [
      'full_name',
      'phone_number',
      'email',
      'gender',
      'date_of_birth',
      'address',
      'plan_type',
      'paid_duration_months',
      'plan_amount',
      'plan_start_date',
    ]) {
      const value = form.get(key);
      fields[key] = typeof value === 'string' ? value : '';
    }

    const validated = buildValidatedRegistration(fields);
    if (!validated.ok) {
      return json({ ok: false, error: validated.error, code: 'validation_error' }, 400);
    }

    const { data: memberFields } = validated;
    const fileName = `${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await admin.storage
      .from(SELFIE_BUCKET)
      .upload(fileName, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return json(
        {
          ok: false,
          error:
            "Couldn't upload your selfie. Check your connection and try again.",
          code: 'upload_failed',
        },
        502,
      );
    }

    uploadedPath = fileName;

    const insertPayload = {
      ...memberFields,
      selfie_url: fileName,
      current_period_end: addCalendarMonths(
        memberFields.plan_start_date,
        memberFields.paid_duration_months,
      ),
      payment_status: 'paid',
      notes: null,
    };

    const { data: inserted, error: insertError } = await admin
      .from('members')
      .insert(insertPayload)
      .select(
        'id, full_name, phone_number, email, gender, date_of_birth, address, selfie_url, plan_type, plan_duration_days, plan_start_date, paid_duration_months, current_period_end, plan_amount, payment_status, notes, created_at, updated_at',
      )
      .maybeSingle();

    if (insertError) {
      console.error(insertError);

      const { error: cleanupError } = await admin.storage
        .from(SELFIE_BUCKET)
        .remove([fileName]);

      if (cleanupError) {
        console.error(
          'Registration insert failed and selfie cleanup also failed:',
          { path: fileName, cleanupError },
        );
      }

      uploadedPath = null;

      const message = String(insertError.message || '').toLowerCase();
      const code = String(insertError.code || '');
      if (
        message.includes('duplicate') ||
        message.includes('unique') ||
        code === '23505'
      ) {
        return json(
          {
            ok: false,
            error:
              'This phone number is already registered. Please use a different number or ask the front desk for help.',
            code: 'duplicate_phone',
          },
          409,
        );
      }

      return json(
        {
          ok: false,
          error: "Couldn't save member. Check your connection and try again.",
          code: 'insert_failed',
        },
        502,
      );
    }

    return json({
      ok: true,
      member: inserted ?? {
        ...insertPayload,
        id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);

    if (uploadedPath) {
      try {
        const { error: cleanupError } = await admin.storage
          .from(SELFIE_BUCKET)
          .remove([uploadedPath]);
        if (cleanupError) {
          console.error(
            'Unexpected registration failure and selfie cleanup also failed:',
            { path: uploadedPath, cleanupError },
          );
        }
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }

    return json(
      {
        ok: false,
        error: "Couldn't save member. Check your connection and try again.",
        code: 'unexpected_error',
      },
      500,
    );
  }
});
