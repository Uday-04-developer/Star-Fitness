import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './Hero.module.css';

const Hero = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const targets = [
        `.${styles.eyebrow}`,
        `.${styles.headline}`,
        `.${styles.subheadline}`,
        `.${styles.actions}`,
      ];

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
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.heroDuration,
          ease: MOTION.easeOut,
          stagger: MOTION.heroStagger,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleJoin = () => {
    navigate('/register');
  };

  return (
    <section ref={containerRef} className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.mesh} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>Star Fitness Gym</p>
        <h1 id="hero-heading" className={styles.headline}>
          Train hard.
          <br />
          Look sharp.
          <br />
          Feel stronger.
        </h1>
        <p className={styles.subheadline}>
          A premium training space built for real results — modern equipment,
          expert coaches, and memberships that stay simple.
        </p>
        <div className={styles.actions}>
          <LiquidButton
            label="Join Now"
            onClick={handleJoin}
            variant="solid"
            icon={ArrowRight}
            iconPosition="right"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
