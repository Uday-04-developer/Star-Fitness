import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import Loader from '@/components/common/Loader/Loader';
import Modal from '@/components/common/Modal/Modal';
import MemberCardVisual from '@/components/dashboard/MemberCardVisual/MemberCardVisual';
import WhatsAppButton from '@/components/dashboard/WhatsAppButton/WhatsAppButton';
import {
  deleteMember,
  fetchMemberById,
  useMembers,
} from '@/hooks/useMembers';
import { formatDisplayDate, formatPlanLabel } from '@/utils/date';
import { getReminderMessage } from '@/utils/whatsapp';
import styles from './MemberCard.module.css';

const MemberCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, isLoading: isListLoading } = useMembers();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setDeleteError('');
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
          <Button
            label="Back to Dashboard"
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
          <MemberCardVisual member={member} />

          <GlassCard padding="lg" className={styles.details}>
            <h2 className={styles.detailsTitle}>Member details</h2>

            <dl className={styles.detailsList}>
              <div>
                <dt>Phone</dt>
                <dd>{member.phone_number}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{member.email || '—'}</dd>
              </div>
              <div>
                <dt>Plan</dt>
                <dd>{formatPlanLabel(member.plan_type)}</dd>
              </div>
              <div>
                <dt>Plan start</dt>
                <dd>{formatDisplayDate(member.plan_start_date)}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd className={styles.capitalize}>{member.payment_status}</dd>
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

            <div className={styles.actions}>
              {/* Phase 2: full inline member edit UI (see docs/09-roadmap.md). */}
              <WhatsAppButton
                memberId={member.id}
                phoneNumber={member.phone_number}
                message={getReminderMessage(member)}
                label="Send Reminder"
              />
              <Button
                label="Delete Member"
                variant="danger"
                icon={Trash2}
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
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleCloseDelete}
            disabled={isDeleting}
          />
          <Button
            label="Delete"
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MemberCard;
