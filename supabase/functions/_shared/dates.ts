/** Asia/Kolkata date helpers — mirrors src/utils/date.js business rules. */

const TIME_ZONE = 'Asia/Kolkata';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const parseDateOnly = (value: string) => {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return { year, month, day };
};

const partsToIso = ({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) => {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

export const getTodayIsoDate = (now = new Date()) => {
  const parts = dateFormatter.formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return partsToIso({
    year: get('year'),
    month: get('month'),
    day: get('day'),
  });
};

export const isIsoDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').slice(0, 10));

export const compareIsoDates = (left: string, right: string) => {
  const a = toUtcMidnight(parseDateOnly(left));
  const b = toUtcMidnight(parseDateOnly(right));
  return a - b;
};

const toUtcMidnight = ({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) => Date.UTC(year, month - 1, day);

export const addDaysToIsoDate = (isoDate: string, days: number) => {
  const start = parseDateOnly(isoDate);
  const end = new Date(
    Date.UTC(start.year, start.month - 1, start.day + days),
  );
  return partsToIso({
    year: end.getUTCFullYear(),
    month: end.getUTCMonth() + 1,
    day: end.getUTCDate(),
  });
};

/**
 * Add calendar months to a date-only ISO string, clamping to month end.
 */
export const addCalendarMonths = (isoDate: string, months: number) => {
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
