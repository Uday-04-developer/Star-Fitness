import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/marketing/Navbar/Navbar';
import Footer from '@/components/marketing/Footer/Footer';
import AboutSection from '@/components/marketing/AboutSection/AboutSection';
import { useLenis } from '@/hooks/useLenis';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './About.module.css';

const About = () => {
  const headerRef = useRef(null);

  useLenis();

  useEffect(() => {
    document.title = 'About — Star Fitness Gym';

    const metaDescription = document.querySelector('meta[name="description"]');
    const description =
      'Learn about Star Fitness Gym — founded by Lokesh Verma, built for serious training in a premium local space.';

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
      const targets = [
        `.${styles.eyebrow}`,
        `.${styles.title}`,
        `.${styles.lead}`,
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
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <header ref={headerRef} className={styles.header}>
          <div className={styles.mesh} aria-hidden="true" />
          <div className={styles.headerContent}>
            <p className={styles.eyebrow}>About Star Fitness</p>
            <h1 className={styles.title}>A gym built with intention</h1>
            <p className={styles.lead}>
              Premium floors, clear memberships, and a culture that values
              consistency over noise.
            </p>
          </div>
        </header>
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
