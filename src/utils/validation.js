export const validateFullName = (value) => {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return 'Full name is required.';
  }

  if (trimmed.length < 2) {
    return 'Enter your full name.';
  }

  return '';
};

export const validatePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return 'Phone number is required.';
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }

  return '';
};

export const validateEmail = (value) => {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return '';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return '';
};

export const validatePlan = (value) => {
  if (!value) {
    return 'Please select a membership plan.';
  }

  return '';
};

export const validatePaidDuration = (value) => {
  const months = Number(value);
  if (![1, 2, 3, 6, 12].includes(months)) {
    return 'Select how many months were paid (1, 2, 3, 6, or 12).';
  }

  return '';
};

export const validatePlanStartDate = (value, { min, max } = {}) => {
  const date = String(value || '').slice(0, 10);

  if (!date) {
    return 'Choose your joining date.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Choose a valid joining date.';
  }

  if (min && date < min) {
    return 'Joining date cannot be in the past.';
  }

  if (max && date > max) {
    return 'Joining date must be within the next 5 days.';
  }

  return '';
};
