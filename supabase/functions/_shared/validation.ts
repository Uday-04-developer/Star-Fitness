import {
  GENDER_OPTIONS,
  PAID_DURATION_OPTIONS,
  PLAN_DURATIONS,
} from './constants.ts';
import {
  addDaysToIsoDate,
  compareIsoDates,
  getTodayIsoDate,
  isIsoDateString,
} from './dates.ts';

/** Matches src/lib/constants.js DATE_PICKER_WINDOW_DAYS — today … today+N. */
const JOIN_DATE_FUTURE_DAYS = 5;

export type RegistrationFields = {
  full_name: string;
  phone_number: string;
  email: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  plan_type: string;
  plan_duration_days: number;
  plan_start_date: string;
  paid_duration_months: number;
  plan_amount: number | null;
};

export const validateFullName = (value: unknown) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Enter your full name.';
  return '';
};

export const validatePhone = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return 'Phone number is required.';
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return '';
};

export const validateEmail = (value: unknown) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return '';
};

export const validatePlan = (value: unknown) => {
  const plan = String(value || '');
  if (!plan || !(plan in PLAN_DURATIONS)) {
    return 'Please select a membership plan.';
  }
  return '';
};

export const validatePaidDuration = (value: unknown) => {
  const months = Number(value);
  if (!(PAID_DURATION_OPTIONS as readonly number[]).includes(months)) {
    return 'Select how many months were paid (1, 2, 3, 6, or 12).';
  }
  return '';
};

export const validateGender = (value: unknown) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (!(GENDER_OPTIONS as readonly string[]).includes(trimmed)) {
    return 'Choose a valid gender option.';
  }
  return '';
};

export const validateDob = (value: unknown) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (!isIsoDateString(trimmed)) {
    return 'Enter a valid date of birth.';
  }
  const today = getTodayIsoDate();
  if (compareIsoDates(trimmed.slice(0, 10), '1920-01-01') < 0) {
    return 'Enter a valid date of birth.';
  }
  if (compareIsoDates(trimmed.slice(0, 10), today) > 0) {
    return 'Date of birth cannot be in the future.';
  }
  return '';
};

/**
 * plan_start_date: today through today+5 (Asia/Kolkata). Past / too-far future rejected.
 */
export const validatePlanStartDate = (value: unknown) => {
  const trimmed = String(value || '').trim();
  const today = getTodayIsoDate();
  const date = trimmed || today;
  const max = addDaysToIsoDate(today, JOIN_DATE_FUTURE_DAYS);

  if (!isIsoDateString(date)) {
    return 'Choose a valid membership start date.';
  }

  const day = date.slice(0, 10);

  if (compareIsoDates(day, today) < 0) {
    return 'Membership start date cannot be in the past.';
  }

  if (compareIsoDates(day, max) > 0) {
    return 'Membership start date must be within the next 5 days.';
  }

  return '';
};

export const validatePlanAmount = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) {
    return 'Enter a valid plan amount.';
  }
  return '';
};

export const buildValidatedRegistration = (
  input: Record<string, unknown>,
): { ok: true; data: RegistrationFields } | { ok: false; error: string } => {
  const checks = [
    validateFullName(input.full_name),
    validatePhone(input.phone_number),
    validateEmail(input.email),
    validateGender(input.gender),
    validateDob(input.date_of_birth),
    validatePlan(input.plan_type),
    validatePaidDuration(input.paid_duration_months),
    validatePlanStartDate(input.plan_start_date),
    validatePlanAmount(input.plan_amount),
  ].filter(Boolean);

  if (checks.length > 0) {
    return { ok: false, error: checks[0] };
  }

  const planType = String(input.plan_type);
  const phoneDigits = String(input.phone_number).replace(/\D/g, '');
  const paidMonths = Number(input.paid_duration_months);
  const today = getTodayIsoDate();
  const startRaw = String(input.plan_start_date || '').trim();
  const planStartDate = startRaw || today;
  const email = String(input.email || '').trim();
  const gender = String(input.gender || '').trim();
  const dob = String(input.date_of_birth || '').trim();
  const address = String(input.address || '').trim();
  const amountRaw = String(input.plan_amount ?? '').trim();

  return {
    ok: true,
    data: {
      full_name: String(input.full_name).trim(),
      phone_number: phoneDigits,
      email: email || null,
      gender: gender || null,
      date_of_birth: dob || null,
      address: address || null,
      plan_type: planType,
      plan_duration_days: PLAN_DURATIONS[planType],
      plan_start_date: planStartDate.slice(0, 10),
      paid_duration_months: paidMonths,
      plan_amount: amountRaw ? Number(amountRaw) : null,
    },
  };
};

export const isUuid = (value: unknown) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(String(value || ''));
