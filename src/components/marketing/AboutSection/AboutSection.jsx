import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Dumbbell,
  HeartPulse,
  BicepsFlexed,
  Lock,
  ShowerHead,
  Wind,
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './AboutSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const FACILITIES = [
  {
    title: 'Strength Zone',
    description: 'Racks, benches, and machines set up for focused heavy work.',
    icon: Dumbbell,
  },
  {
    title: 'Cardio Zone',
    description: 'Treadmills, bikes, and rowers for warm-ups and conditioning.',
    icon: HeartPulse,
  },
  {
    title: 'Free Weights',
    description: 'Dumbbells and plates kept clean and ready for every session.',
    icon: BicepsFlexed,
  },
  {
    title: ' Rooms',
    description: 'Secure and space to get ready before you hit the floor.',
    icon: Lock,
  },
  {
    title: 'Traning Area',
    description: 'A dedicated area for training with a focus on strength and conditioning.',
    icon: ShowerHead,
  },
  {
    title: 'Open Floor',
    description: 'Bright, well-ventilated training space with room to move.',
    icon: Wind,
  },
];

const AboutSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const story = `.${styles.story}`;
      const cards = gsap.utils.toArray(`.${styles.card}`);

      if (reduced) {
        gsap.fromTo(
          [story, ...cards],
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
        story,
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
            trigger: `.${styles.facilities}`,
            start: MOTION.scrollStart,
            toggleActions: 'play none none none',
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.story}>
          <p className={styles.eyebrow}>Our Story</p>
          <h2 className={styles.title}>Built for people who take training seriously</h2>
          <div className={styles.copy}>
            <p>
              Star Fitness Gym was founded by Lokesh Verma with a simple idea:
              a local gym should feel premium, stay clean, and make membership
              easy to manage — for members and for the people running the floor.
            </p>
            <p>
              What started as a focused training space has grown into a community
              of members who show up for strength, conditioning, and consistency.
              No gimmicks. No clutter. Just a place built for real work.
            </p>
          </div>
        </div>

        <div className={styles.facilities}>
          <div className={styles.facilitiesHeading}>
            <p className={styles.eyebrow}>Facilities</p>
            <h2 className={styles.title}>Everything you need on the floor</h2>
            <p className={styles.lead}>
              Zones designed for clear flow — so you spend less time searching
              and more time training.
            </p>
          </div>

          <div className={styles.grid}>
            {FACILITIES.map((facility) => {
              const Icon = facility.icon;

              return (
                <div key={facility.title} className={styles.card}>
                  <GlassCard interactive padding="lg">
                    <div className={styles.iconWrap} aria-hidden="true">
                      <Icon size={24} strokeWidth={1.75} />
                    </div>
                    <h3 className={styles.cardTitle}>{facility.title}</h3>
                    <p className={styles.cardBody}>{facility.description}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
