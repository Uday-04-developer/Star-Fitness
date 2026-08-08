export const PLAN_DURATIONS = {
  monthly: 30,
  quarterly: 90,
  half_yearly: 182,
  yearly: 365,
};

/** Allowed paid chunks (calendar months). Last paid chunk only. */
export const PAID_DURATION_OPTIONS = [1, 2, 3, 6, 12];

/** Default paid months when a plan package is selected. */
export const PLAN_TO_PAID_MONTHS = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
};

/** Map legacy plan_duration_days → paid months (migration B / defaults). */
export const planDaysToPaidMonths = (days) => {
  const map = {
    [PLAN_DURATIONS.monthly]: 1,
    [PLAN_DURATIONS.quarterly]: 3,
    [PLAN_DURATIONS.half_yearly]: 6,
    [PLAN_DURATIONS.yearly]: 12,
  };
  return map[Number(days)] ?? 1;
};

export const EXPIRING_SOON_THRESHOLD_DAYS = 3;

/** Inclusive window for registration date picker (today … today+N-1). */
export const DATE_PICKER_WINDOW_DAYS = 5;

export const MOTION = {
  easeOut: 'power2.out',
  easeInOut: 'power2.inOut',
  entranceDuration: 0.6,
  heroDuration: 0.5,
  heroStagger: 0.1,
  scrollStart: 'top 80%',
  reducedFade: 0.2,
};
