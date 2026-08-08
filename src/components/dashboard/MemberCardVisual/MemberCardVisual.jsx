import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Badge from '@/components/common/Badge/Badge';
import {
  formatDisplayDate,
  formatPlanLabel,
  getMembershipStatus,
  getPlanEndDate,
} from '@/utils/date';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './MemberCardVisual.module.css';

const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const MemberCardVisual = ({ member }) => {
  const cardRef = useRef(null);
  const status = getMembershipStatus(member);
  const endDate = getPlanEndDate(member);
  const memberSince = formatDisplayDate(member.created_at?.slice(0, 10) || member.plan_start_date);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0 },
          { opacity: 1, duration: MOTION.reducedFade, ease: MOTION.easeOut },
        );
        return;
      }

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: MOTION.entranceDuration,
          ease: MOTION.easeOut,
        },
      );
    }, cardRef);

    return () => ctx.revert();
  }, [member.id]);

  return (
    <article ref={cardRef} className={styles.card} aria-label="Member digital card">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.top}>
        <p className={styles.brand}>
          Star <span className={styles.brandAccent}>Fitness</span>
        </p>
        <Badge status={status} />
      </div>

      <div className={styles.identity}>
        {member.selfie_url ? (
          <img
            className={styles.photo}
            src={member.selfie_url}
            alt={`Photo of ${member.full_name}`}
          />
        ) : (
          <div className={styles.avatar} aria-hidden="true">
            {getInitials(member.full_name)}
          </div>
        )}

        <div>
          <h2 className={styles.name}>{member.full_name}</h2>
          <p className={styles.plan}>{formatPlanLabel(member.plan_type)} plan</p>
        </div>
      </div>

      <dl className={styles.meta}>
        <div>
          <dt>Membership ends</dt>
          <dd>{formatDisplayDate(endDate)}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{memberSince}</dd>
        </div>
      </dl>
    </article>
  );
};

export default MemberCardVisual;
