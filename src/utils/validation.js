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
