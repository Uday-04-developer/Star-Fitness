import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import Loader from '@/components/common/Loader/Loader';
import Modal from '@/components/common/Modal/Modal';
import CallButton from '@/components/dashboard/CallButton/CallButton';
import MemberCardVisual from '@/components/dashboard/MemberCardVisual/MemberCardVisual';
import WhatsAppButton from '@/components/dashboard/WhatsAppButton/WhatsAppButton';
import { PAID_DURATION_OPTIONS, PLAN_DURATIONS } from '@/lib/constants';
import {
  deleteMember,
  fetchMemberById,
  useMembers,
} from '@/hooks/useMembers';
import {
  addCalendarMonths,
  formatDisplayDate,
  formatPaidDurationLabel,
  formatPlanLabel,
  getTodayIsoDate,
} from '@/utils/date';
import { getReminderMessage } from '@/utils/whatsapp';
import styles from './MemberCard.module.css';

const PLAN_OPTIONS = Object.keys(PLAN_DURATIONS);

const MemberCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    members,
    isLoading: isListLoading,
    updatePaymentStatus,
    updatePlan,
    renewMembership,
    updatePeriodEnd,
  } = useMembers();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [planDraft, setPlanDraft] = useState('');
  const [renewMonths, setRenewMonths] = useState('1');
  const [expiryDraft, setExpiryDraft] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isSavingExpiry, setIsSavingExpiry] = useState(false);
  const [editError, setEditError] = useState('');
  const [editNotice, setEditNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    const resolveMember = async () => {
      setLoadError('');
      const cached = members.find((row) => row.id === id);

      if (cached) {
        if (!cancelled) {
          setMember(cached);
          setIsLoading(false);
        }
        return;
      }

      if (isListLoading) {
        if (!cancelled) {
          setIsLoading(true);
        }
        return;
      }

      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const row = await fetchMemberById(id);
        if (!cancelled) {
          setMember(row);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMember(null);
          setLoadError(
            error?.message || "Couldn't load this member. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    resolveMember();

    return () => {
      cancelled = true;
    };
  }, [id, members, isListLoading]);

  useEffect(() => {
    document.title = member
      ? `${member.full_name} — Star Fitness`
      : 'Member — Star Fitness';
  }, [member]);

  useEffect(() => {
    if (!member) {
      return;
    }
    setPlanDraft(member.plan_type || '');
    setRenewMonths(String(member.paid_duration_months || 1));
    setExpiryDraft(String(member.current_period_end || '').slice(0, 10));
  }, [member]);

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setDeleteError('');
  };

  const handleSavePlan = async () => {
    if (!member || !planDraft || planDraft === member.plan_type) {
      return;
    }
    setEditError('');
    setEditNotice('');
    setIsSavingPlan(true);
    try {
      await updatePlan(member.id, planDraft);
      setEditNotice('Plan package updated. Expiry was not changed.');
    } catch (error) {
      setEditError(error?.message || "Couldn't update plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handlePaymentChange = async (nextStatus) => {
    if (!member || nextStatus === member.payment_status) {
      return;
    }
    setEditError('');
    setEditNotice('');
    setIsSavingPayment(true);
    try {
      await updatePaymentStatus(member.id, nextStatus);
      setEditNotice(
        nextStatus === 'paid'
          ? 'Marked as paid (dates unchanged).'
          : 'Marked as pending (dates unchanged).',
      );
    } catch (error) {
      setEditError(error?.message || "Couldn't update payment.");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRenew = async () => {
    if (!member) {
      return;
    }
    setEditError('');
    setEditNotice('');
    setIsRenewing(true);
    try {
      await renewMembership(member.id, Number(renewMonths));
      setEditNotice('Membership renewed. Join date unchanged.');
    } catch (error) {
      setEditError(error?.message || "Couldn't renew membership.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleSaveExpiry = async () => {
    if (!member || !expiryDraft) {
      return;
    }
    const current = String(member.current_period_end || '').slice(0, 10);
    if (expiryDraft === current) {
      return;
    }
    setEditError('');
    setEditNotice('');
    setIsSavingExpiry(true);
    try {
      await updatePeriodEnd(member.id, expiryDraft);
      setEditNotice('Expiry updated. Join date unchanged.');
    } catch (error) {
      setEditError(error?.message || "Couldn't update expiry.");
    } finally {
      setIsSavingExpiry(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteMember(id);
      setIsDeleteOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setDeleteError(
        error?.message || "Couldn't delete this member. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Loader size="lg" label="Loading member" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Member not found</h1>
          <p className={styles.notFoundCopy}>
            {loadError ||
              'This member may have been deleted, or the link is invalid.'}
          </p>
          <LiquidButton
            label="Back to Dashboard"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          Back to dashboard
        </button>
        <Link to="/" className={styles.logo}>
          Star <span className={styles.logoAccent}>Fitness</span>
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <div className={styles.visualCol}>
            <MemberCardVisual member={member} />
            <div className={styles.visualActions}>
              <CallButton phoneNumber={member.phone_number} />
              <WhatsAppButton
                memberId={member.id}
                phoneNumber={member.phone_number}
                message={getReminderMessage(member)}
                label="WhatsApp"
                fullWidth
              />
            </div>
          </div>

          <GlassCard padding="lg" className={styles.details}>
            <h2 className={styles.detailsTitle}>Member details</h2>

            <dl className={styles.detailsList}>
              <div>
                <dt>Phone</dt>
                <dd>
                  <CallButton
                    phoneNumber={member.phone_number}
                    label={member.phone_number}
                  />
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{member.email || '—'}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{formatDisplayDate(member.plan_start_date)}</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>{formatDisplayDate(member.current_period_end)}</dd>
              </div>
              <div>
                <dt>Paid duration</dt>
                <dd>{formatPaidDurationLabel(member.paid_duration_months)}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>
                  {member.plan_amount != null
                    ? `₹${Number(member.plan_amount).toLocaleString('en-IN')}`
                    : '—'}
                </dd>
              </div>
              <div className={styles.notes}>
                <dt>Notes</dt>
                <dd>{member.notes || 'No notes yet.'}</dd>
              </div>
            </dl>

            <section className={styles.editSection} aria-label="Edit membership">
              <h3 className={styles.editTitle}>Edit</h3>
              <p className={styles.editCopy}>
                Plan is the selected package only. Renew extends expiry. Correct
                expiry when paid months differ from what was recorded. Paid /
                Pending is a flag and never moves dates.
              </p>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="detail-plan">
                  Plan package
                </label>
                <div className={styles.editRow}>
                  <select
                    id="detail-plan"
                    className={styles.editSelect}
                    value={planDraft}
                    onChange={(event) => setPlanDraft(event.target.value)}
                    disabled={isSavingPlan}
                  >
                    {PLAN_OPTIONS.map((planType) => (
                      <option key={planType} value={planType}>
                        {formatPlanLabel(planType)}
                      </option>
                    ))}
                  </select>
                  <LiquidButton
                    label="Save plan"
                    variant="secondary"
                    hoverScale={1.03}
                    onClick={handleSavePlan}
                    isLoading={isSavingPlan}
                    disabled={planDraft === member.plan_type}
                  />
                </div>
              </div>

              <div className={styles.editField}>
                <DatePicker
                  label="Correct expiry"
                  name="current_period_end"
                  value={expiryDraft}
                  onChange={(event) => setExpiryDraft(event.target.value)}
                  min={String(member.plan_start_date || '').slice(0, 10)}
                  max={addCalendarMonths(getTodayIsoDate(), 60)}
                  helperText="e.g. said 4 months but paid for 2 — set the real end date. Join date stays the same."
                />
                <div className={styles.editRow}>
                  <span className={styles.editHint}>
                    Current: {formatDisplayDate(member.current_period_end)}
                  </span>
                  <LiquidButton
                    label="Save expiry"
                    variant="secondary"
                    hoverScale={1.03}
                    onClick={handleSaveExpiry}
                    isLoading={isSavingExpiry}
                    disabled={
                      expiryDraft ===
                      String(member.current_period_end || '').slice(0, 10)
                    }
                  />
                </div>
              </div>

              <div className={styles.editField}>
                <p className={styles.editLabel}>Payment flag</p>
                <div className={styles.editToggle}>
                  <LiquidButton
                    label="Paid"
                    fullWidth
                    hoverScale={1.03}
                    variant={
                      member.payment_status === 'paid' ? 'success' : 'secondary'
                    }
                    onClick={() => handlePaymentChange('paid')}
                    disabled={isSavingPayment}
                  />
                  <LiquidButton
                    label="Pending"
                    fullWidth
                    hoverScale={1.03}
                    variant={
                      member.payment_status === 'pending'
                        ? 'warning'
                        : 'secondary'
                    }
                    onClick={() => handlePaymentChange('pending')}
                    disabled={isSavingPayment}
                  />
                </div>
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="detail-renew">
                  Renew membership
                </label>
                <div className={styles.editRow}>
                  <select
                    id="detail-renew"
                    className={styles.editSelect}
                    value={renewMonths}
                    onChange={(event) => setRenewMonths(event.target.value)}
                    disabled={isRenewing}
                  >
                    {PAID_DURATION_OPTIONS.map((months) => (
                      <option key={months} value={String(months)}>
                        {formatPaidDurationLabel(months)}
                      </option>
                    ))}
                  </select>
                  <LiquidButton
                    label="Renew"
                    variant="primary"
                    hoverScale={1.03}
                    onClick={handleRenew}
                    isLoading={isRenewing}
                  />
                </div>
              </div>

              {editNotice ? (
                <p className={styles.editNotice} role="status">
                  {editNotice}
                </p>
              ) : null}
              {editError ? (
                <p className={styles.editError} role="alert">
                  {editError}
                </p>
              ) : null}
            </section>

            <div className={styles.actions}>
              <LiquidButton
                label="Delete Member"
                variant="danger"
                icon={Trash2}
                hoverScale={1.03}
                onClick={() => setIsDeleteOpen(true)}
              />
            </div>
          </GlassCard>
        </div>
      </main>

      <Modal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        title="Delete member?"
      >
        <p className={styles.modalCopy}>
          This will permanently remove <strong>{member.full_name}</strong> from
          your member list.
        </p>
        {deleteError ? (
          <p className={styles.modalError} role="alert">
            {deleteError}
          </p>
        ) : null}
        <div className={styles.modalActions}>
          <LiquidButton
            label="Cancel"
            variant="secondary"
            hoverScale={1.03}
            onClick={handleCloseDelete}
            disabled={isDeleting}
          />
          <LiquidButton
            label="Delete"
            variant="danger"
            hoverScale={1.03}
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MemberCard;
