import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import MemberFlipCard from '@/components/dashboard/MemberFlipCard/MemberFlipCard';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './MemberCardGrid.module.css';

const SKELETON_COUNT = 6;

const MemberCardGrid = ({
  members,
  isLoading,
  onPaymentStatusChange,
}) => {
  const [flippedId, setFlippedId] = useState(null);
  const gridRef = useRef(null);

  const handleFlip = (memberId) => {
    setFlippedId((current) => (current === memberId ? null : memberId));
  };

  useEffect(() => {
    if (isLoading || !members.length || !gridRef.current) {
      return undefined;
    }

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll(`.${styles.item}`);

      gsap.fromTo(
        cards,
        { opacity: 0, y: reduced ? 0 : 18 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? MOTION.reducedFade : 0.42,
          stagger: reduced ? 0 : 0.05,
          ease: MOTION.easeOut,
          clearProps: 'transform',
          overwrite: 'auto',
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [isLoading, members]);

  if (isLoading) {
    return (
      <div
        className={styles.grid}
        aria-busy="true"
        aria-label="Loading members"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={`skeleton-${index}`} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className={styles.empty}>
        <h3 className={styles.emptyTitle}>No members yet</h3>
        <p className={styles.emptyCopy}>
          Register your first member to see their card here.
        </p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className={styles.grid}>
      {members.map((member) => (
        <div key={member.id} className={styles.item}>
          <MemberFlipCard
            member={member}
            isFlipped={flippedId === member.id}
            onFlip={handleFlip}
            onPaymentStatusChange={onPaymentStatusChange}
          />
        </div>
      ))}
    </div>
  );
};

export default MemberCardGrid;
