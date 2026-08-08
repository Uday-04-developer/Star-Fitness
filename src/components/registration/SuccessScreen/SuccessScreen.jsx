import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import {
  formatDisplayDate,
  formatPlanLabel,
  getPlanEndDate,
} from '@/utils/date';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './SuccessScreen.module.css';

const SuccessScreen = ({ member, warning = '' }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const endDate = getPlanEndDate(member);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const targets = [
        `.${styles.iconWrap}`,
        `.${styles.title}`,
        `.${styles.copy}`,
        `.${styles.warning}`,
        `.${styles.summary}`,
        `.${styles.actions}`,
      ].filter((selector) => {
        if (selector === `.${styles.warning}` && !warning) {
          return false;
        }
        return true;
      });

      if (reduced) {
        gsap.fromTo(
          targets,
          { opacity: 0 },
          { opacity: 1, duration: MOTION.reducedFade, ease: MOTION.easeOut },
        );
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: MOTION.entranceDuration,
          ease: MOTION.easeOut,
          stagger: MOTION.heroStagger,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [warning]);

  const handleRegisterAnother = () => {
    window.location.assign('/register');
  };

  return (
    <section ref={containerRef} className={styles.screen} aria-live="polite">
      <div className={styles.iconWrap} aria-hidden="true">
        <CheckCircle2 size={40} strokeWidth={1.75} />
      </div>
      <h1 className={styles.title}>You're in, {member.full_name.split(' ')[0]}!</h1>
      <p className={styles.copy}>
        Registration is complete. Your membership is ready — see you on the floor.
      </p>

      {warning ? (
        <p className={styles.warning} role="status">
          {warning}
        </p>
      ) : null}

      <dl className={styles.summary}>
        <div>
          <dt>Plan</dt>
          <dd>{formatPlanLabel(member.plan_type)}</dd>
        </div>
        <div>
          <dt>Valid until</dt>
          <dd>{formatDisplayDate(endDate)}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Button label="Back to Home" variant="secondary" onClick={() => navigate('/')} />
        <Button label="Register Another" onClick={handleRegisterAnother} />
      </div>
    </section>
  );
};

export default SuccessScreen;
