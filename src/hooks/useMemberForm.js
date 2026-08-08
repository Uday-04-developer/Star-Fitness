import { useCallback, useReducer } from 'react';
import { PLAN_DURATIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import {
  validateEmail,
  validateFullName,
  validatePhone,
  validatePlan,
} from '@/utils/validation';

const initialState = {
  values: {
    full_name: '',
    phone_number: '',
    email: '',
    gender: '',
    date_of_birth: '',
    address: '',
    plan_type: '',
    plan_amount: '',
  },
  errors: {},
  selfieBlob: null,
  selfiePreviewUrl: '',
  status: 'idle',
  submitError: '',
  submitWarning: '',
  createdMember: null,
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
      };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

const buildMemberInsert = (values, selfieUrl) => {
  const planType = values.plan_type;
  const phoneDigits = String(values.phone_number).replace(/\D/g, '');
  const today = new Date().toISOString().slice(0, 10);

  return {
    full_name: values.full_name.trim(),
    phone_number: phoneDigits,
    email: values.email.trim() || null,
    gender: values.gender || null,
    date_of_birth: values.date_of_birth || null,
    address: values.address.trim() || null,
    selfie_url: selfieUrl,
    plan_type: planType,
    plan_duration_days: PLAN_DURATIONS[planType],
    plan_start_date: today,
    plan_amount: values.plan_amount ? Number(values.plan_amount) : null,
    payment_status: 'paid',
    notes: null,
  };
};

const uploadSelfie = async (blob) => {
  const fileName = `${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('member-selfies')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('member-selfies').getPublicUrl(fileName);
  return data.publicUrl;
};

const toFriendlyInsertError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '');

  if (message.includes('duplicate') || message.includes('unique') || code === '23505') {
    return 'This phone number is already registered. Please use a different number or ask the front desk for help.';
  }

  if (
    message.includes('jwt') ||
    message.includes('api key') ||
    code === '401' ||
    error?.status === 401
  ) {
    return "Couldn't reach the database. Ask the gym owner to check Supabase keys and that the schema was applied.";
  }

  if (message.includes('row-level security') || message.includes('rls') || code === '42501') {
    return "Couldn't save member (permission denied). Ask the gym owner to apply the Supabase RLS policies.";
  }

  return "Couldn't save member. Check your connection and try again.";
};

export const useMemberForm = ({ onMemberCreated } = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setField = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
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
    const errors = {
      full_name: validateFullName(state.values.full_name),
      phone_number: validatePhone(state.values.phone_number),
      email: validateEmail(state.values.email),
      plan_type: validatePlan(state.values.plan_type),
      selfie: state.selfieBlob
        ? ''
        : 'A selfie is required. Turn on the camera and capture your photo.',
    };

    return Object.fromEntries(
      Object.entries(errors).filter(([, message]) => Boolean(message)),
    );
  }, [state.selfieBlob, state.values]);

  const submit = useCallback(async () => {
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }

    dispatch({ type: 'SUBMIT_START' });

    try {
      let selfieUrl;
      try {
        selfieUrl = await uploadSelfie(state.selfieBlob);
      } catch (uploadError) {
        console.error(uploadError);
        throw new Error(
          "Couldn't upload your selfie. Check your connection and try again.",
        );
      }

      // Insert only — anon RLS allows INSERT but not SELECT, so
      // `.select()` / RETURNING would 401 under the documented policies.
      const insertPayload = buildMemberInsert(state.values, selfieUrl);
      const { error } = await supabase.from('members').insert(insertPayload);

      if (error) {
        console.error(error);
        throw error;
      }

      const member = {
        ...insertPayload,
        id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onMemberCreated?.(member, '');
      dispatch({ type: 'SUBMIT_SUCCESS', member, warning: '' });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'SUBMIT_ERROR',
        message:
          error?.message?.startsWith("Couldn't upload")
            ? error.message
            : toFriendlyInsertError(error),
      });
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
    isSubmitting: state.status === 'submitting',
    setField,
    setSelfie,
    submit,
    reset,
  };
};
