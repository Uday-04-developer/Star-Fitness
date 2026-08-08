import {
  DATE_PICKER_WINDOW_DAYS,
  EXPIRING_SOON_THRESHOLD_DAYS,
} from '@/lib/constants';

const TIME_ZONE = 'Asia/Kolkata';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const displayFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const monthTitleFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

const parseDateOnly = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return { year, month, day };
};

const toUtcMidnight = ({ year, month, day }) =>
  Date.UTC(year, month - 1, day);

const partsToIso = ({ year, month, day }) => {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

export const getTodayDateParts = (now = new Date()) => {
  const parts = dateFormatter.formatToParts(now);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  };
};

export const getTodayIsoDate = (now = new Date()) =>
  partsToIso(getTodayDateParts(now));

export const addDaysToIsoDate = (isoDate, days) => {
  const start = parseDateOnly(isoDate);
  const end = new Date(Date.UTC(start.year, start.month - 1, start.day + days));
  return partsToIso({
    year: end.getUTCFullYear(),
    month: end.getUTCMonth() + 1,
    day: end.getUTCDate(),
  });
};

/**
 * Add calendar months to a date-only ISO string, clamping to the last valid
 * day of the target month (e.g. Jan 31 + 1 month → Feb 28/29).
 */
export const addCalendarMonths = (isoDate, months) => {
  const { year, month, day } = parseDateOnly(isoDate);
  const monthIndex = month - 1 + Number(months);
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonthIndex = ((monthIndex % 12) + 12) % 12;
  const daysInTarget = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0),
  ).getUTCDate();
  const clampedDay = Math.min(day, daysInTarget);

  return partsToIso({
    year: targetYear,
    month: targetMonthIndex + 1,
    day: clampedDay,
  });
};

export const compareIsoDates = (a, b) => {
  const left = toUtcMidnight(parseDateOnly(a));
  const right = toUtcMidnight(parseDateOnly(b));
  return left - right;
};

export const isIsoDateInRange = (isoDate, minIso, maxIso) =>
  compareIsoDates(isoDate, minIso) >= 0 && compareIsoDates(isoDate, maxIso) <= 0;

/** Today (Asia/Kolkata) through today + (windowDays - 1), e.g. Aug 8 → Aug 12 when window=5. */
export const getNearTermDateRange = (
  now = new Date(),
  windowDays = DATE_PICKER_WINDOW_DAYS,
) => {
  const min = getTodayIsoDate(now);
  const max = addDaysToIsoDate(min, Math.max(windowDays, 1) - 1);
  return { min, max };
};

/** Past floor through today (Asia/Kolkata) — for date of birth only. */
export const getDobDateRange = (now = new Date()) => ({
  min: '1920-01-01',
  max: getTodayIsoDate(now),
});

export const formatMonthTitle = (year, month) =>
  monthTitleFormatter.format(new Date(Date.UTC(year, month - 1, 1)));

export const getCalendarCells = (year, month) => {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(partsToIso({ year, month, day }));
  }

  return cells;
};

export const getPlanEndDate = (member) => {
  // Sole access/expiry source of truth (Phase 1).
  if (member?.current_period_end) {
    return String(member.current_period_end).slice(0, 10);
  }

  return '';
};

/**
 * Next period end for a renew: active → stack on current end; expired → today + months.
 * Does not mutate plan_start_date.
 */
export const computeRenewalPeriodEnd = (
  member,
  paidDurationMonths,
  now = new Date(),
) => {
  const today = getTodayIsoDate(now);
  const currentEnd = getPlanEndDate(member);
  const base =
    currentEnd && compareIsoDates(currentEnd, today) >= 0 ? currentEnd : today;
  return addCalendarMonths(base, paidDurationMonths);
};

export const getDaysRemaining = (member, now = new Date()) => {
  const endIso = getPlanEndDate(member);
  if (!endIso) {
    return 0;
  }

  const end = parseDateOnly(endIso);
  const today = getTodayDateParts(now);
  const diffMs = toUtcMidnight(end) - toUtcMidnight(today);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const getMembershipStatus = (member, now = new Date()) => {
  const daysRemaining = getDaysRemaining(member, now);

  if (daysRemaining < 0) {
    return 'expired';
  }

  if (daysRemaining <= EXPIRING_SOON_THRESHOLD_DAYS) {
    return 'expiring_soon';
  }

  return 'active';
};

export const formatDaysRemainingLabel = (member, now = new Date()) => {
  const days = getDaysRemaining(member, now);

  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1 ? 'Expired 1 day ago' : `Expired ${overdue} days ago`;
  }

  if (days === 0) {
    return 'Expires today';
  }

  if (days === 1) {
    return '1 day left';
  }

  return `${days} days left`;
};

export const formatDisplayDate = (value) => {
  if (!value) {
    return '—';
  }

  const { year, month, day } = parseDateOnly(value);
  return displayFormatter.format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatPlanLabel = (planType) => {
  const labels = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half-Yearly',
    yearly: 'Yearly',
  };

  return labels[planType] || planType;
};

export const formatPaidDurationLabel = (months) => {
  const value = Number(months);
  if (!value) {
    return '—';
  }
  return value === 1 ? '1 month' : `${value} months`;
};
