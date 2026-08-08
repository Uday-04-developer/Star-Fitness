import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MEMBER_COLUMNS =
  'id, full_name, phone_number, email, gender, date_of_birth, address, selfie_url, plan_type, plan_duration_days, plan_start_date, plan_amount, payment_status, notes, created_at, updated_at';

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
      previous = current.find((row) => row.id === id)?.payment_status ?? null;
      return current.map((row) =>
        row.id === id ? { ...row, payment_status: paymentStatus } : row,
      );
    });

    try {
      await updateMemberPaymentStatus(id, paymentStatus);
    } catch (err) {
      setMembers((current) =>
        current.map((row) =>
          row.id === id
            ? { ...row, payment_status: previous || row.payment_status }
            : row,
        ),
      );
      throw err;
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    updatePaymentStatus,
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
