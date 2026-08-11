export const PLAN_DURATIONS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  half_yearly: 182,
  yearly: 365,
};

export const PAID_DURATION_OPTIONS = [1, 2, 3, 6, 12] as const;

export const SELFIE_BUCKET = 'member-selfies';

/** Max JPEG bytes accepted by register-member (server-side hard limit). */
export const MAX_SELFIE_BYTES = 2 * 1024 * 1024;

/** Reject requests larger than this (selfie + form fields). */
export const MAX_REQUEST_BYTES = 3 * 1024 * 1024;

export const GENDER_OPTIONS = ['male', 'female', 'other'] as const;
