import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RotateCcw } from 'lucide-react';
import Badge from '@/components/common/Badge/Badge';
import WhatsAppButton from '@/components/dashboard/WhatsAppButton/WhatsAppButton';
import { MOTION } from '@/lib/constants';
import {
  formatDaysRemainingLabel,
  formatDisplayDate,
  formatPlanLabel,
  getMembershipStatus,
  getPlanEndDate,
} from '@/utils/date';
import { prefersReducedMotion } from '@/utils/motion';
import { getReminderMessage } from '@/utils/whatsapp';
import styles from './MemberFlipCard.module.css';

const TILT_DIVISOR = 22;

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
}) => {
  const tiltRef = useRef(null);
  const cardRef = useRef(null);
  const backContentRef = useRef(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const status = getMembershipStatus(member);
  const endDate = getPlanEndDate(member);
  const daysLabel = formatDaysRemainingLabel(member);
  const joinedDate = formatDisplayDate(
    member.plan_start_date || member.created_at?.slice(0, 10),
  );
  const isPaid = member.payment_status === 'paid';

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

    if (isFlipped && tiltRef.current) {
      tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }

    return () => {
      tween.kill();
    };
  }, [isFlipped]);

  const resetTilt = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
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

  return (
    <div className={styles.scene}>
      <div
        ref={tiltRef}
        className={styles.tilt}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
      >
        <div ref={cardRef} className={styles.card}>
          <div
            className={[styles.face, styles.front].join(' ')}
            role="button"
            tabIndex={isFlipped ? -1 : 0}
            onClick={handleFrontActivate}
            onKeyDown={handleFrontKeyDown}
            aria-label={`${member.full_name}, ${daysLabel}. Flip for details.`}
          >
            <div className={styles.photoLayer}>
              {member.selfie_url ? (
                <img className={styles.photo} src={member.selfie_url} alt="" />
              ) : (
                <div className={styles.avatar} aria-hidden="true">
                  {getInitials(member.full_name)}
                </div>
              )}
            </div>

            <div className={styles.frontBody}>
              <h3 className={styles.name}>{member.full_name}</h3>
              <p className={styles.days}>{daysLabel}</p>
              <p className={styles.joined}>Joined {joinedDate}</p>
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
            aria-hidden={!isFlipped}
          >
            <div ref={backContentRef} className={styles.backInner}>
              <div className={styles.backTop}>
                <div className={styles.backIdentity}>
                  {member.selfie_url ? (
                    <img
                      className={styles.thumb}
                      src={member.selfie_url}
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
                  <dd>{member.phone_number}</dd>
                </div>
                <div>
                  <dt>Ends</dt>
                  <dd>{formatDisplayDate(endDate)}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{joinedDate}</dd>
                </div>
              </dl>

              <div className={styles.paymentBlock}>
                <p className={styles.paymentLabel}>Payment</p>
                <div
                  className={styles.paymentToggle}
                  role="group"
                  aria-label="Payment status"
                >
                  <button
                    type="button"
                    className={[
                      styles.paymentBtn,
                      isPaid ? styles.paymentBtnActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={isSavingPayment}
                    onClick={() => handlePaymentChange('paid')}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    className={[
                      styles.paymentBtn,
                      !isPaid ? styles.paymentBtnPending : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={isSavingPayment}
                    onClick={() => handlePaymentChange('pending')}
                  >
                    Pending
                  </button>
                </div>
                {paymentError ? (
                  <p className={styles.paymentError} role="alert">
                    {paymentError}
                  </p>
                ) : null}
              </div>

              <div className={styles.backActions}>
                <WhatsAppButton
                  memberId={member.id}
                  phoneNumber={member.phone_number}
                  message={getReminderMessage(member)}
                  label="Send reminder"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberFlipCard;
