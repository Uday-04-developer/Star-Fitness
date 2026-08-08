import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import AnimatedTestimonials from '@/components/marketing/AnimatedTestimonials/AnimatedTestimonials';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import lokesh from '@/assets/images/lokesh.png';
import styles from './Hero.module.css';

const MEMBER_STORIES = [
  {
    quote:
      'I walked in unsure. Six months later I am stronger, calmer, and finally consistent.',
    name: 'Ananya Sharma',
    designation: 'Member · 8 months',
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  },
  {
    quote:
      'The floor never feels crowded. Coaches notice form, push when needed, and keep sessions honest.',
    name: 'Rohit Mehta',
    designation: 'Member · Powerlifting',
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  {
    quote:
      'Membership is simple. No pressure packages — just train, recover, and come back sharper.',
    name: 'Priya Nair',
    designation: 'Member · Strength & mobility',
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    quote:
      'We built Star Fitness for real work — clean equipment, clear plans, and results you can feel.',
    name: 'Lokesh Verma',
    designation: 'Owner · Head coach',
    src: lokesh,
  },
];

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
        `.${styles.stories}`,
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

      <div className={styles.shell}>
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

        <div className={styles.stories} aria-label="Member stories">
          <AnimatedTestimonials testimonials={MEMBER_STORIES} autoplay />
        </div>
      </div>
    </section>
  );
};

export default Hero;
