import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dumbbell, Users, Sparkles, CalendarDays } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './FeaturesSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: 'Serious Equipment',
    description:
      'Free weights, machines, and conditioning tools kept ready for every session — no waiting around for basics.',
    icon: Dumbbell,
  },
  {
    title: 'Coaches Who Care',
    description:
      'Guidance that meets you where you are, whether you are starting out or pushing for your next PR.',
    icon: Users,
  },
  {
    title: 'Clean Floor, Always',
    description:
      'A gym you are proud to walk into — clear stations, fresh air, and standards that stick every day.',
    icon: Sparkles,
  },
  {
    title: 'Plans That Fit',
    description:
      'Monthly to yearly memberships with clear dates and status — so renewals never catch you off guard.',
    icon: CalendarDays,
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(`.${styles.card}`);

      if (reduced) {
        gsap.fromTo(
          [`.${styles.heading}`, ...cards],
          { opacity: 0 },
          {
            opacity: 1,
            duration: MOTION.reducedFade,
            ease: MOTION.easeOut,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: MOTION.scrollStart,
              toggleActions: 'play none none none',
            },
          },
        );
        return;
      }

      gsap.fromTo(
        `.${styles.heading}`,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.entranceDuration,
          ease: MOTION.easeOut,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: MOTION.scrollStart,
            toggleActions: 'play none none none',
          },
        },
      );

      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.entranceDuration,
          ease: MOTION.easeOut,
          stagger: MOTION.heroStagger,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: MOTION.scrollStart,
            toggleActions: 'play none none none',
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="features-heading"
    >
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Why Star Fitness</p>
          <h2 id="features-heading" className={styles.title}>
            Built for people who show up
          </h2>
          <p className={styles.lead}>
            Everything you need to train consistently — without the clutter,
            noise, or guesswork.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className={styles.card}>
                <GlassCard interactive padding="lg">
                  <div className={styles.iconWrap} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className={styles.cardTitle}>{feature.title}</h3>
                  <p className={styles.cardBody}>{feature.description}</p>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
