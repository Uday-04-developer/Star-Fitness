import { useCallback, useEffect, useState } from 'react';
import { PAID_DURATION_OPTIONS, PLAN_DURATIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { computeRenewalPeriodEnd } from '@/utils/date';

const MEMBER_COLUMNS =
  'id, full_name, phone_number, email, gender, date_of_birth, address, selfie_url, plan_type, plan_duration_days, plan_start_date, paid_duration_months, current_period_end, plan_amount, payment_status, notes, created_at, updated_at';

/** Payment flag only — never mutates join date or period end. */
export const updateMemberPaymentStatus = async (id, paymentStatus) => {
  if (paymentStatus !== 'paid' && paymentStatus !== 'pending') {
    throw new Error('Invalid payment status.');
  }

  const { error } = await supabase
    .from('members')
    .update({ payment_status: paymentStatus })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Couldn't update payment status. Please try again.");
  }

  return { payment_status: paymentStatus };
};

/** Update selected package only — does not change join date or expiry. */
export const updateMemberPlan = async (id, planType) => {
  const plan_duration_days = PLAN_DURATIONS[planType];
  if (!plan_duration_days) {
    throw new Error('Choose a valid membership plan.');
  }

  const payload = { plan_type: planType, plan_duration_days };
  const { error } = await supabase.from('members').update(payload).eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Couldn't update plan. Please try again.");
  }

  return payload;
};

/**
 * Correct access expiry only — does not change plan_start_date.
 * Use when paid months differ from what was originally recorded.
 */
export const updateMemberPeriodEnd = async (id, currentPeriodEnd) => {
  const current_period_end = String(currentPeriodEnd || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(current_period_end)) {
    throw new Error('Choose a valid expiry date.');
  }

  const { error } = await supabase
    .from('members')
    .update({ current_period_end })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Couldn't update expiry. Please try again.");
  }

  return { current_period_end };
};

/**
 * Renew membership with a paid chunk. Does not change plan_start_date.
 * Active/expiring: stack on current_period_end. Expired: today + months.
 */
export const renewMember = async (id, member, paidDurationMonths) => {
  const months = Number(paidDurationMonths);
  if (!PAID_DURATION_OPTIONS.includes(months)) {
    throw new Error('Choose a valid paid duration (1, 2, 3, 6, or 12 months).');
  }

  const current_period_end = computeRenewalPeriodEnd(member, months);
  const payload = {
    paid_duration_months: months,
    current_period_end,
    payment_status: 'paid',
  };

  const { error } = await supabase.from('members').update(payload).eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Couldn't renew membership. Please try again.");
  }

  return payload;
};

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('members')
        .select(MEMBER_COLUMNS)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error(queryError);
        throw new Error("Couldn't load members. Check your connection and try again.");
      }

      setMembers(data || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Couldn't load members. Check your connection and try again.",
      );
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel('members-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          setMembers((current) => {
            if (payload.eventType === 'INSERT') {
              const exists = current.some((row) => row.id === payload.new.id);
              if (exists) {
                return current.map((row) =>
                  row.id === payload.new.id ? payload.new : row,
                );
              }
              return [payload.new, ...current];
            }

            if (payload.eventType === 'UPDATE') {
              const existing = current.find((row) => row.id === payload.new.id);
              if (
                existing &&
                existing.payment_status === payload.new.payment_status &&
                existing.plan_start_date === payload.new.plan_start_date &&
                existing.current_period_end === payload.new.current_period_end &&
                existing.paid_duration_months ===
                  payload.new.paid_duration_months &&
                existing.full_name === payload.new.full_name &&
                existing.phone_number === payload.new.phone_number &&
                existing.selfie_url === payload.new.selfie_url &&
                existing.notes === payload.new.notes &&
                existing.plan_type === payload.new.plan_type &&
                existing.plan_duration_days === payload.new.plan_duration_days
              ) {
                return current;
              }
              return current.map((row) =>
                row.id === payload.new.id ? payload.new : row,
              );
            }

            if (payload.eventType === 'DELETE') {
              return current.filter((row) => row.id !== payload.old.id);
            }

            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMembers]);

  const updatePaymentStatus = useCallback(async (id, paymentStatus) => {
    let previous = null;

    setMembers((current) => {
      const row = current.find((item) => item.id === id);
      previous = row ? { payment_status: row.payment_status } : null;

      return current.map((item) =>
        item.id === id ? { ...item, payment_status: paymentStatus } : item,
      );
    });

    try {
      await updateMemberPaymentStatus(id, paymentStatus);
    } catch (err) {
      if (previous) {
        setMembers((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, payment_status: previous.payment_status }
              : item,
          ),
        );
      }
      throw err;
    }
  }, []);

  const updatePlan = useCallback(async (id, planType) => {
    let previous = null;
    const plan_duration_days = PLAN_DURATIONS[planType];

    setMembers((current) => {
      const row = current.find((item) => item.id === id);
      previous = row
        ? {
            plan_type: row.plan_type,
            plan_duration_days: row.plan_duration_days,
          }
        : null;

      return current.map((item) =>
        item.id === id
          ? { ...item, plan_type: planType, plan_duration_days }
          : item,
      );
    });

    try {
      return await updateMemberPlan(id, planType);
    } catch (err) {
      if (previous) {
        setMembers((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...previous } : item,
          ),
        );
      }
      throw err;
    }
  }, []);

  const renewMembership = useCallback(async (id, paidDurationMonths) => {
    let previous = null;
    let memberSnapshot = null;

    setMembers((current) => {
      const row = current.find((item) => item.id === id);
      if (!row) {
        return current;
      }

      memberSnapshot = row;
      previous = {
        paid_duration_months: row.paid_duration_months,
        current_period_end: row.current_period_end,
        payment_status: row.payment_status,
      };

      const next = {
        paid_duration_months: Number(paidDurationMonths),
        current_period_end: computeRenewalPeriodEnd(row, paidDurationMonths),
        payment_status: 'paid',
      };

      return current.map((item) =>
        item.id === id ? { ...item, ...next } : item,
      );
    });

    if (!memberSnapshot) {
      throw new Error("Couldn't find this member to renew.");
    }

    try {
      return await renewMember(id, memberSnapshot, paidDurationMonths);
    } catch (err) {
      if (previous) {
        setMembers((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...previous } : item,
          ),
        );
      }
      throw err;
    }
  }, []);

  const updatePeriodEnd = useCallback(async (id, currentPeriodEnd) => {
    let previous = null;
    const nextEnd = String(currentPeriodEnd || '').slice(0, 10);

    setMembers((current) => {
      const row = current.find((item) => item.id === id);
      previous = row ? { current_period_end: row.current_period_end } : null;

      return current.map((item) =>
        item.id === id ? { ...item, current_period_end: nextEnd } : item,
      );
    });

    try {
      return await updateMemberPeriodEnd(id, nextEnd);
    } catch (err) {
      if (previous) {
        setMembers((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...previous } : item,
          ),
        );
      }
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (id) => {
    let snapshot = null;

    setMembers((current) => {
      snapshot = current.find((row) => row.id === id) || null;
      return current.filter((row) => row.id !== id);
    });

    try {
      await deleteMember(id);
    } catch (err) {
      if (snapshot) {
        setMembers((current) => [snapshot, ...current]);
      }
      throw err;
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    updatePaymentStatus,
    updatePlan,
    renewMembership,
    updatePeriodEnd,
    removeMember,
  };
};

export const fetchMemberById = async (id) => {
  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Couldn't load this member. Please try again.");
  }

  return data;
};

export const deleteMember = async (id) => {
  const { error } = await supabase.from('members').delete().eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Couldn't delete this member. Please try again.");
  }
};
