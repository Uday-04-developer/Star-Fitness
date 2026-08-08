import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/marketing/Navbar/Navbar';
import Footer from '@/components/marketing/Footer/Footer';
import Hero from '@/components/marketing/Hero/Hero';
import FeaturesSection from '@/components/marketing/FeaturesSection/FeaturesSection';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import { useLenis } from '@/hooks/useLenis';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './Home.module.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const ctaRef = useRef(null);
  const navigate = useNavigate();

  useLenis();

  useEffect(() => {
    document.title = 'Star Fitness Gym — Premium Fitness, Real Results';

    const metaDescription = document.querySelector('meta[name="description"]');
    const description =
      'Train at Star Fitness Gym — modern equipment, expert coaches, and simple memberships in a premium space.';

    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: MOTION.reducedFade,
            ease: MOTION.easeOut,
            scrollTrigger: {
              trigger: ctaRef.current,
              start: MOTION.scrollStart,
              toggleActions: 'play none none none',
            },
          },
        );
        return;
      }

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.entranceDuration,
          ease: MOTION.easeOut,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: MOTION.scrollStart,
            toggleActions: 'play none none none',
          },
        },
      );
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  const handleStart = () => {
    navigate('/register');
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <Hero />
        <FeaturesSection />

        <section
          ref={ctaRef}
          className={styles.ctaSection}
          aria-labelledby="cta-heading"
        >
          <GlassCard padding="lg" className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 id="cta-heading" className={styles.ctaTitle}>
                Ready to start?
              </h2>
              <p className={styles.ctaCopy}>
                Register in minutes, pick your plan, and walk onto the floor with
                confidence.
              </p>
              <LiquidButton
                label="Start Registration"
                onClick={handleStart}
                variant="solid"
              />
            </div>
          </GlassCard>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
