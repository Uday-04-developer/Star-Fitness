import { useCallback, useEffect, useRef, useState } from 'react';
import { PAID_DURATION_OPTIONS, PLAN_DURATIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { computeRenewalPeriodEnd, getMembershipStatus } from '@/utils/date';

/** Grid page size — Dashboard Load more appends this many rows per request. */
export const MEMBERS_PAGE_SIZE = 50;

const MEMBER_COLUMNS =
  'id, full_name, phone_number, email, gender, date_of_birth, address, selfie_url, plan_type, plan_duration_days, plan_start_date, paid_duration_months, current_period_end, plan_amount, payment_status, notes, created_at, updated_at';

/** Lean columns for whole-gym StatCards — never used to mount cards or sign selfies. */
const STATS_COLUMNS = 'id, current_period_end';

const EMPTY_STATS = {
  total: 0,
  active: 0,
  expiring_soon: 0,
  expired: 0,
};

/** Escape `%` / `_` / `\` for PostgREST `ilike` patterns. */
const escapeIlikePattern = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

/**
 * Build `.or(...)` filter for name/phone search.
 * Strips commas so PostgREST or-lists stay valid; quotes patterns for spaces.
 */
const buildNamePhoneSearchFilter = (rawQuery) => {
  const cleaned = String(rawQuery).trim().replace(/,/g, ' ').replace(/"/g, '');
  const pattern = `%${escapeIlikePattern(cleaned)}%`;
  return `full_name.ilike."${pattern}",phone_number.ilike."${pattern}"`;
};

const computeMemberStats = (rows) => {
  const counts = { ...EMPTY_STATS, total: rows.length };

  rows.forEach((row) => {
    const status = getMembershipStatus(row);
    counts[status] += 1;
  });

  return counts;
};

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
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchCapped, setSearchCapped] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  /** Next PostgREST `.range` start — independent of realtime prepends. */
  const nextFromRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);
  /** 'browse' | 'search' — realtime INSERT prepend only in browse. */
  const listModeRef = useRef('browse');
  const searchRequestIdRef = useRef(0);

  const fetchMemberStats = useCallback(async () => {
    const { data, error: statsError } = await supabase
      .from('members')
      .select(STATS_COLUMNS);

    if (statsError) {
      console.error(statsError);
      throw new Error("Couldn't load member stats. Check your connection and try again.");
    }

    return computeMemberStats(data || []);
  }, []);

  const fetchMemberPage = useCallback(async (from) => {
    const to = from + MEMBERS_PAGE_SIZE - 1;
    const { data, error: queryError } = await supabase
      .from('members')
      .select(MEMBER_COLUMNS)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (queryError) {
      console.error(queryError);
      throw new Error("Couldn't load members. Check your connection and try again.");
    }

    return data || [];
  }, []);

  const fetchMembers = useCallback(async () => {
    searchRequestIdRef.current += 1;
    listModeRef.current = 'browse';
    setIsSearchMode(false);
    setSearchCapped(false);
    setIsSearching(false);
    setIsLoading(true);
    setError(null);
    nextFromRef.current = 0;
    loadMoreInFlightRef.current = false;

    try {
      const [page, nextStats] = await Promise.all([
        fetchMemberPage(0),
        fetchMemberStats(),
      ]);

      nextFromRef.current = page.length;
      setMembers(page);
      setStats(nextStats);
      setHasMore(page.length === MEMBERS_PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Couldn't load members. Check your connection and try again.",
      );
      setMembers([]);
      setStats(EMPTY_STATS);
      setHasMore(false);
      nextFromRef.current = 0;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMemberPage, fetchMemberStats]);

  /**
   * Server search across the whole members table (name or phone).
   * Empty query restores paginated browse (page 1 refetch).
   */
  const searchMembers = useCallback(
    async (rawQuery) => {
      const query = String(rawQuery || '').trim();

      if (!query) {
        if (listModeRef.current === 'search') {
          await fetchMembers();
        }
        return;
      }

      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      listModeRef.current = 'search';
      setIsSearchMode(true);
      setHasMore(false);
      setIsSearching(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from('members')
          .select(MEMBER_COLUMNS)
          .or(buildNamePhoneSearchFilter(query))
          .order('created_at', { ascending: false })
          .limit(MEMBERS_PAGE_SIZE);

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        if (queryError) {
          console.error(queryError);
          throw new Error("Couldn't search members. Check your connection and try again.");
        }

        const page = data || [];
        setMembers(page);
        setSearchCapped(page.length === MEMBERS_PAGE_SIZE);
      } catch (err) {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        console.error(err);
        setError(
          err?.message ||
            "Couldn't search members. Check your connection and try again.",
        );
        setMembers([]);
        setSearchCapped(false);
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [fetchMembers],
  );

  const loadMore = useCallback(async () => {
    if (
      listModeRef.current === 'search' ||
      loadMoreInFlightRef.current ||
      isLoading ||
      !hasMore
    ) {
      return;
    }

    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const from = nextFromRef.current;
      const page = await fetchMemberPage(from);
      nextFromRef.current = from + page.length;

      setMembers((current) => {
        if (!page.length) {
          return current;
        }
        const seen = new Set(current.map((row) => row.id));
        const appended = page.filter((row) => !seen.has(row.id));
        return appended.length ? [...current, ...appended] : current;
      });

      setHasMore(page.length === MEMBERS_PAGE_SIZE);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Couldn't load more members. Check your connection and try again.",
      );
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [fetchMemberPage, hasMore, isLoading]);

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel('members-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          /*
           * Loaded-window patch only:
           * - INSERT (browse): prepend so new registrations appear immediately.
           * - INSERT (search): do not prepend non-matching rows into results.
           * - UPDATE: patch if id is already in the current list.
           * - DELETE: remove if loaded.
           * Stats refresh lean (whole gym) after membership-affecting events.
           */
          const shouldRefreshStats =
            payload.eventType === 'INSERT' ||
            payload.eventType === 'DELETE' ||
            (payload.eventType === 'UPDATE' &&
              payload.new?.current_period_end !==
                payload.old?.current_period_end);

          setMembers((current) => {
            if (payload.eventType === 'INSERT') {
              const exists = current.some((row) => row.id === payload.new.id);
              if (exists) {
                return current.map((row) =>
                  row.id === payload.new.id ? payload.new : row,
                );
              }
              if (listModeRef.current === 'search') {
                return current;
              }
              return [payload.new, ...current];
            }

            if (payload.eventType === 'UPDATE') {
              const existing = current.find((row) => row.id === payload.new.id);
              if (!existing) {
                return current;
              }
              if (
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

          if (shouldRefreshStats) {
            fetchMemberStats()
              .then((nextStats) => {
                setStats(nextStats);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMembers, fetchMemberStats]);

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
      return await updateMemberPaymentStatus(id, paymentStatus);
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

    // Detail page may renew a member not yet in the loaded grid pages.
    if (!memberSnapshot) {
      memberSnapshot = await fetchMemberById(id);
      if (!memberSnapshot) {
        throw new Error("Couldn't find this member to renew.");
      }
    }

    try {
      const payload = await renewMember(
        id,
        memberSnapshot,
        paidDurationMonths,
      );
      fetchMemberStats()
        .then((nextStats) => setStats(nextStats))
        .catch((err) => console.error(err));
      return payload;
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
  }, [fetchMemberStats]);

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
      const payload = await updateMemberPeriodEnd(id, nextEnd);
      fetchMemberStats()
        .then((nextStats) => setStats(nextStats))
        .catch((err) => console.error(err));
      return payload;
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
  }, [fetchMemberStats]);

  const removeMember = useCallback(async (id) => {
    let snapshot = null;

    setMembers((current) => {
      snapshot = current.find((row) => row.id === id) || null;
      return current.filter((row) => row.id !== id);
    });

    try {
      await deleteMember(id);
      fetchMemberStats()
        .then((nextStats) => setStats(nextStats))
        .catch((err) => console.error(err));
    } catch (err) {
      if (snapshot) {
        setMembers((current) => [snapshot, ...current]);
      }
      throw err;
    }
  }, [fetchMemberStats]);

  return {
    members,
    stats,
    isLoading,
    isLoadingMore,
    isSearching,
    isSearchMode,
    searchCapped,
    hasMore,
    error,
    refetch: fetchMembers,
    loadMore,
    searchMembers,
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
  const { data, error } = await supabase.functions.invoke('delete-member', {
    body: { memberId: id },
  });

  if (error) {
    console.error(error);
    let message = "Couldn't delete this member. Please try again.";
    try {
      if (error?.context && typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body?.error) {
          message = String(body.error);
        }
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  if (!data?.ok) {
    throw new Error(
      data?.error || "Couldn't delete this member. Please try again.",
    );
  }
};
