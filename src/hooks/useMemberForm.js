import { useCallback, useReducer, useRef } from 'react';
import { PLAN_TO_PAID_MONTHS, PAID_DURATION_OPTIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { getNearTermDateRange, getTodayIsoDate } from '@/utils/date';
import {
  validateEmail,
  validateFullName,
  validatePaidDuration,
  validatePhone,
  validatePlan,
  validatePlanStartDate,
} from '@/utils/validation';

const initialState = {
  values: {
    full_name: '',
    phone_number: '',
    email: '',
    gender: '',
    plan_start_date: getTodayIsoDate(),
    address: '',
    plan_type: '',
    paid_duration_months: '',
    plan_amount: '',
  },
  errors: {},
  selfieBlob: null,
  selfiePreviewUrl: '',
  status: 'idle',
  submitError: '',
  submitWarning: '',
  createdMember: null,
  errorFocusToken: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value,
        },
        errors: {
          ...state.errors,
          [action.field]: '',
        },
        submitError: '',
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
        status: 'idle',
        errorFocusToken: state.errorFocusToken + 1,
      };
    case 'SET_SELFIE':
      return {
        ...state,
        selfieBlob: action.blob,
        selfiePreviewUrl: action.previewUrl || '',
        errors: {
          ...state.errors,
          selfie: '',
        },
        submitError: '',
      };
    case 'CLEAR_SELFIE':
      return {
        ...state,
        selfieBlob: null,
        selfiePreviewUrl: '',
      };
    case 'SUBMIT_START':
      return {
        ...state,
        status: 'submitting',
        submitError: '',
        submitWarning: '',
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        status: 'success',
        createdMember: action.member,
        submitWarning: action.warning || '',
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        status: 'error',
        submitError: action.message,
        errorFocusToken: state.errorFocusToken + 1,
      };
    case 'RESET':
      return {
        ...initialState,
        values: {
          ...initialState.values,
          plan_start_date: getTodayIsoDate(),
        },
      };
    default:
      return state;
  }
};

const readFunctionErrorMessage = async (error, fallback) => {
  try {
    if (error?.context && typeof error.context.json === 'function') {
      const body = await error.context.json();
      if (body?.error) {
        return String(body.error);
      }
    }
  } catch {
    // ignore parse failures
  }

  return fallback;
};

export const useMemberForm = ({ onMemberCreated } = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isSubmittingRef = useRef(false);

  const setField = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setPlanType = useCallback((planType) => {
    dispatch({ type: 'SET_FIELD', field: 'plan_type', value: planType });
    const defaultPaid = PLAN_TO_PAID_MONTHS[planType];
    if (defaultPaid && PAID_DURATION_OPTIONS.includes(defaultPaid)) {
      dispatch({
        type: 'SET_FIELD',
        field: 'paid_duration_months',
        value: String(defaultPaid),
      });
    }
  }, []);

  const setSelfie = useCallback((blob) => {
    if (!blob) {
      dispatch({ type: 'CLEAR_SELFIE' });
      return;
    }

    const previewUrl = URL.createObjectURL(blob);
    dispatch({ type: 'SET_SELFIE', blob, previewUrl });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const validate = useCallback(() => {
    const joinRange = getNearTermDateRange();
    const errors = {
      full_name: validateFullName(state.values.full_name),
      phone_number: validatePhone(state.values.phone_number),
      email: validateEmail(state.values.email),
      plan_start_date: validatePlanStartDate(state.values.plan_start_date, {
        min: joinRange.min,
        max: joinRange.max,
      }),
      plan_type: validatePlan(state.values.plan_type),
      paid_duration_months: validatePaidDuration(
        state.values.paid_duration_months,
      ),
      selfie: state.selfieBlob
        ? ''
        : 'A selfie is required. Turn on the camera and capture your photo.',
    };

    return Object.fromEntries(
      Object.entries(errors).filter(([, message]) => Boolean(message)),
    );
  }, [state.selfieBlob, state.values]);

  const submit = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }

    isSubmittingRef.current = true;
    dispatch({ type: 'SUBMIT_START' });

    try {
      const formData = new FormData();
      formData.append('selfie', state.selfieBlob, 'selfie.jpg');
      formData.append('full_name', state.values.full_name.trim());
      formData.append(
        'phone_number',
        String(state.values.phone_number).replace(/\D/g, ''),
      );
      formData.append('email', state.values.email.trim());
      formData.append('gender', state.values.gender || '');
      formData.append('date_of_birth', '');
      formData.append('address', state.values.address.trim());
      formData.append('plan_type', state.values.plan_type);
      formData.append(
        'paid_duration_months',
        String(state.values.paid_duration_months),
      );
      formData.append('plan_amount', state.values.plan_amount || '');
      formData.append(
        'plan_start_date',
        String(state.values.plan_start_date).slice(0, 10),
      );

      const { data, error } = await supabase.functions.invoke(
        'register-member',
        { body: formData },
      );

      if (error) {
        console.error(error);
        const message = await readFunctionErrorMessage(
          error,
          "Couldn't save member. Check your connection and try again.",
        );
        throw new Error(message);
      }

      if (!data?.ok || !data?.member) {
        throw new Error(
          data?.error ||
            "Couldn't save member. Check your connection and try again.",
        );
      }

      onMemberCreated?.(data.member, '');
      dispatch({ type: 'SUBMIT_SUCCESS', member: data.member, warning: '' });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'SUBMIT_ERROR',
        message:
          error?.message ||
          "Couldn't save member. Check your connection and try again.",
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }, [onMemberCreated, state.selfieBlob, state.values, validate]);

  return {
    values: state.values,
    errors: state.errors,
    selfiePreviewUrl: state.selfiePreviewUrl,
    status: state.status,
    submitError: state.submitError,
    submitWarning: state.submitWarning,
    createdMember: state.createdMember,
    errorFocusToken: state.errorFocusToken,
    isSubmitting: state.status === 'submitting',
    setField,
    setPlanType,
    setSelfie,
    submit,
    reset,
  };
};
