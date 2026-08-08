import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ExternalLink, RotateCcw, Trash2 } from 'lucide-react';
import Badge from '@/components/common/Badge/Badge';
import Button from '@/components/common/Button/Button';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import Modal from '@/components/common/Modal/Modal';
import CallButton from '@/components/dashboard/CallButton/CallButton';
import WhatsAppButton from '@/components/dashboard/WhatsAppButton/WhatsAppButton';
import { MOTION, PAID_DURATION_OPTIONS } from '@/lib/constants';
import { useSignedSelfieUrl } from '@/hooks/useSignedSelfieUrl';
import {
  formatDaysRemainingLabel,
  formatDisplayDate,
  formatPaidDurationLabel,
  formatPlanLabel,
  computeRenewalPeriodEnd,
  getMembershipStatus,
  getPlanEndDate,
} from '@/utils/date';
import { prefersReducedMotion } from '@/utils/motion';
import { getReminderMessage } from '@/utils/whatsapp';
import styles from './MemberFlipCard.module.css';

const TILT_DIVISOR = 22;

const CARD_GRADIENTS = [
  'linear-gradient(to top right, #0a0a0b, #2f2f33)',
  'linear-gradient(to right, #0d2818, #0a0a0b)',
  'linear-gradient(to bottom, #3c4a1c, #0a0a0b)',
];

const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const canUseHoverTilt = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !prefersReducedMotion();

const MemberFlipCard = ({
  member,
  isFlipped = false,
  onFlip,
  onPaymentStatusChange,
  onRenew,
  onDelete,
  gradientIndex = 0,
}) => {
  const tiltRef = useRef(null);
  const cardRef = useRef(null);
  const sceneRef = useRef(null);
  const frontBodyRef = useRef(null);
  const backContentRef = useRef(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [renewMonths, setRenewMonths] = useState(
    String(member.paid_duration_months || 1),
  );
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const selfieSrc = useSignedSelfieUrl(member.selfie_url);
  const status = getMembershipStatus(member);
  const endDate = getPlanEndDate(member);
  const daysLabel = formatDaysRemainingLabel(member);
  const joinedDate = formatDisplayDate(member.plan_start_date);
  const endsDate = formatDisplayDate(endDate);
  const isPaid = member.payment_status === 'paid';
  const cardGradient = CARD_GRADIENTS[gradientIndex % 3];
  const renewPreviewEnd = formatDisplayDate(
    computeRenewalPeriodEnd(member, Number(renewMonths) || 1),
  );
  const planLabel = formatPlanLabel(member.plan_type);

  const resetTilt = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return undefined;
    }

    gsap.set(card, { transformPerspective: 1200, transformStyle: 'preserve-3d' });

    const tween = gsap.to(card, {
      rotateY: isFlipped ? 180 : 0,
      duration: prefersReducedMotion() ? MOTION.reducedFade : 0.5,
      ease: MOTION.easeInOut,
      force3D: true,
      overwrite: 'auto',
    });

    if (isFlipped && backContentRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        backContentRef.current.children,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          stagger: 0.03,
          delay: 0.2,
          ease: MOTION.easeOut,
          overwrite: 'auto',
        },
      );
    }

    if (!isFlipped && frontBodyRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        frontBodyRef.current.children,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.36,
          stagger: 0.05,
          ease: MOTION.easeOut,
          overwrite: 'auto',
        },
      );
    }

    if (isFlipped && tiltRef.current) {
      tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }

    return () => {
      tween.kill();
    };
  }, [isFlipped]);

  // Clear sticky hover if the pointer left the card without a relatedTarget
  // (native select) and later moves outside the card bounds.
  useEffect(() => {
    if (!isHovered) {
      return undefined;
    }

    const clearIfOutside = (clientX, clientY) => {
      const el = sceneRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (!inside) {
        setIsHovered(false);
        resetTilt();
      }
    };

    const onPointerMove = (event) => {
      clearIfOutside(event.clientX, event.clientY);
    };

    const onBlur = () => {
      setIsHovered(false);
      resetTilt();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onBlur);
    };
  }, [isHovered]);

  const handleCardPointerEnter = () => {
    setIsHovered(true);
  };

  const handleCardPointerLeave = (event) => {
    const { relatedTarget, currentTarget } = event;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    // Native select popups can fire leave with null relatedTarget — keep hover.
    if (!relatedTarget) {
      return;
    }
    setIsHovered(false);
    resetTilt();
  };

  const handleMouseMove = (event) => {
    if (isFlipped || !canUseHoverTilt() || !tiltRef.current) {
      return;
    }

    const { left, top, width, height } = tiltRef.current.getBoundingClientRect();
    const rotateY = (event.clientX - left - width / 2) / TILT_DIVISOR;
    const rotateX = (top + height / 2 - event.clientY) / TILT_DIVISOR;
    tiltRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  };

  const handleFrontActivate = () => {
    resetTilt();
    onFlip?.(member.id);
  };

  const handleFrontKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFrontActivate();
    }
  };

  const handlePaymentChange = async (nextStatus) => {
    if (nextStatus === member.payment_status || isSavingPayment) {
      return;
    }

    setPaymentError('');
    setIsSavingPayment(true);

    try {
      await onPaymentStatusChange?.(member.id, nextStatus);
    } catch (error) {
      console.error(error);
      setPaymentError(
        error?.message || "Couldn't update payment. Try again.",
      );
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRenew = async (event) => {
    event?.stopPropagation?.();
    if (isRenewing || !onRenew) {
      return;
    }

    setRenewError('');
    setIsRenewing(true);

    try {
      await onRenew(member.id, Number(renewMonths));
    } catch (error) {
      console.error(error);
      setRenewError(error?.message || "Couldn't renew membership. Try again.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteOpen(false);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await onDelete?.(member.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      setDeleteError(
        error?.message || "Couldn't delete this member. Try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const faceStyle = { '--card-gradient': cardGradient };
  const frontToneClass = [
    styles.face,
    styles.front,
    styles[`tone_${status}`],
    !isPaid ? styles.tone_unpaid : '',
    isHovered ? styles.isHovered : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={sceneRef}
      className={styles.scene}
      onPointerEnter={handleCardPointerEnter}
      onPointerLeave={handleCardPointerLeave}
    >
      <div
        ref={tiltRef}
        className={styles.tilt}
        onMouseMove={handleMouseMove}
      >
        <div ref={cardRef} className={styles.card}>
          <div
            className={frontToneClass}
            style={faceStyle}
            role="button"
            tabIndex={isFlipped ? -1 : 0}
            onClick={handleFrontActivate}
            onKeyDown={handleFrontKeyDown}
            aria-label={`${member.full_name}, ${daysLabel}. Flip for details.`}
          >
            <div className={styles.hoverGlow} aria-hidden="true" />
            <div className={styles.photoLayer}>
              {selfieSrc ? (
                <img className={styles.photo} src={selfieSrc} alt="" />
              ) : (
                <div className={styles.avatar} aria-hidden="true">
                  {getInitials(member.full_name)}
                </div>
              )}

              <div
                className={styles.photoOverlay}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <div className={styles.photoMeta}>
                  <p className={styles.photoPlan}>{planLabel}</p>
                  <p className={styles.photoEnds}>
                    Ends {endsDate}
                    {onRenew ? (
                      <span className={styles.photoRenewPreview}>
                        {' '}
                        · After renew {renewPreviewEnd}
                      </span>
                    ) : null}
                  </p>
                </div>

                {onRenew ? (
                  <div className={styles.photoRenew}>
                    <select
                      className={styles.renewSelect}
                      value={renewMonths}
                      onChange={(event) => setRenewMonths(event.target.value)}
                      aria-label="Paid duration for renew"
                      disabled={isRenewing}
                    >
                      {PAID_DURATION_OPTIONS.map((months) => (
                        <option key={months} value={String(months)}>
                          {formatPaidDurationLabel(months)}
                        </option>
                      ))}
                    </select>
                    <LiquidButton
                      type="button"
                      label="Renew"
                      size="sm"
                      hoverScale={1.03}
                      variant="primary"
                      disabled={isRenewing}
                      onClick={handleRenew}
                    />
                  </div>
                ) : null}

                {renewError ? (
                  <p className={styles.photoRenewError} role="alert">
                    {renewError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={styles.frontBody} ref={frontBodyRef}>
              <div className={styles.frontIdentity}>
                <h3 className={styles.name}>{member.full_name}</h3>
                <p
                  className={[styles.days, styles[`days_${status}`]].join(' ')}
                >
                  {daysLabel}
                </p>
              </div>

              <div className={styles.metaRow} aria-label="Plan and membership dates">
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Plan</span>
                  <span className={styles.metaValue}>{planLabel}</span>
                </div>
                <div className={styles.metaDivider} aria-hidden="true" />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Joined</span>
                  <span className={styles.metaValue}>{joinedDate}</span>
                </div>
                <div className={styles.metaDivider} aria-hidden="true" />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Ends</span>
                  <span className={styles.metaValue}>{endsDate}</span>
                </div>
              </div>

              <div className={styles.frontFooter}>
                <Badge status={status} />
                <span
                  className={[
                    styles.payChip,
                    isPaid ? styles.payPaid : styles.payPending,
                  ].join(' ')}
                >
                  {isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div
            className={[styles.face, styles.back].join(' ')}
            style={faceStyle}
            aria-hidden={!isFlipped}
          >
            <div ref={backContentRef} className={styles.backInner}>
              <div className={styles.backTop}>
                <div className={styles.backIdentity}>
                  {selfieSrc ? (
                    <img
                      className={styles.thumb}
                      src={selfieSrc}
                      alt=""
                    />
                  ) : (
                    <div className={styles.thumbFallback} aria-hidden="true">
                      {getInitials(member.full_name)}
                    </div>
                  )}
                  <div className={styles.backTitleBlock}>
                    <h3 className={styles.backName}>{member.full_name}</h3>
                    <p className={styles.backMeta}>
                      {formatPlanLabel(member.plan_type)} · {daysLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.flipBackBtn}
                  onClick={() => onFlip?.(null)}
                  aria-label="Flip card back"
                >
                  <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>

              <dl className={styles.details}>
                <div>
                  <dt>Phone</dt>
                  <dd className={styles.phoneAction}>
                    <CallButton
                      phoneNumber={member.phone_number}
                      label={member.phone_number}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{formatPlanLabel(member.plan_type)}</dd>
                </div>
                <div>
                  <dt>Paid</dt>
                  <dd>{formatPaidDurationLabel(member.paid_duration_months)}</dd>
                </div>
              </dl>

              <LiquidButton
                to={`/dashboard/member/${member.id}`}
                label="Show details"
                size="sm"
                fullWidth
                hoverScale={1.03}
                variant="secondary"
                icon={ExternalLink}
                onClick={(event) => event.stopPropagation()}
              />

              <div className={styles.paymentBlock}>
                <p className={styles.paymentLabel}>Payment flag</p>
                <div
                  className={styles.paymentToggle}
                  role="group"
                  aria-label="Payment status"
                >
                  <LiquidButton
                    type="button"
                    label="Paid"
                    size="sm"
                    fullWidth
                    hoverScale={1.03}
                    variant={isPaid ? 'success' : 'secondary'}
                    disabled={isSavingPayment}
                    onClick={() => handlePaymentChange('paid')}
                  />
                  <LiquidButton
                    type="button"
                    label="Pending"
                    size="sm"
                    fullWidth
                    hoverScale={1.03}
                    variant={!isPaid ? 'warning' : 'secondary'}
                    disabled={isSavingPayment}
                    onClick={() => handlePaymentChange('pending')}
                  />
                </div>
                {paymentError ? (
                  <p className={styles.paymentError} role="alert">
                    {paymentError}
                  </p>
                ) : null}
              </div>

              <div className={styles.backActions}>
                <div className={styles.actionRow}>
                  <WhatsAppButton
                    memberId={member.id}
                    phoneNumber={member.phone_number}
                    message={getReminderMessage(member)}
                    label="WhatsApp"
                    fullWidth
                  />
                </div>
                {onDelete ? (
                  <LiquidButton
                    type="button"
                    label="Delete"
                    size="sm"
                    fullWidth
                    hoverScale={1.03}
                    variant="danger"
                    icon={Trash2}
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsDeleteOpen(true);
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        title="Delete member?"
      >
        <p className={styles.modalCopy}>
          This permanently removes <strong>{member.full_name}</strong> from your
          list. This cannot be undone.
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
            icon={Trash2}
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MemberFlipCard;
