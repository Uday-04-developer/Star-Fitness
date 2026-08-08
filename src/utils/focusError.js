/**
 * Scroll the first registration error into view and focus it.
 * Prefer submit banner, then fields in form order.
 */
export const focusFirstRegistrationError = ({
  formEl,
  errors = {},
  submitError = '',
}) => {
  if (!formEl) {
    return;
  }

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollOpts = {
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'center',
  };

  if (submitError) {
    const banner = formEl.querySelector('[data-error-target="submit"]');
    banner?.scrollIntoView(scrollOpts);
    banner?.focus?.({ preventScroll: true });
    return;
  }

  const fieldOrder = [
    'full_name',
    'phone_number',
    'email',
    'plan_type',
    'paid_duration_months',
    'selfie',
  ];

  const firstKey = fieldOrder.find((key) => Boolean(errors[key]));
  if (!firstKey) {
    return;
  }

  const target = formEl.querySelector(`[data-error-target="${firstKey}"]`);
  if (!target) {
    return;
  }

  target.scrollIntoView(scrollOpts);

  const focusable =
    target.matches('input, select, button, textarea, [tabindex]')
      ? target
      : target.querySelector('input, select, button, textarea, [tabindex]');

  focusable?.focus?.({ preventScroll: true });
};
