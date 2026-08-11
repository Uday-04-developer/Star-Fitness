import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextLoop from '@/components/common/TextLoop/TextLoop';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './WelcomeLamp.module.css';

/**
 * Welcome gate shown on every Home visit.
 * Beam grows → glow → copy rises → text loop → Enter.
 */
const WelcomeLamp = ({ open, onEnter }) => {
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKey = (event) => {
      if (event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
        event.preventDefault();
        onEnter();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onEnter]);

  const lineTransition = reduced
    ? { duration: 0 }
    : { duration: 0.95, ease: [0.22, 1, 0.36, 1] };

  const glowTransition = reduced
    ? { duration: 0 }
    : { delay: 0.15, duration: 1, ease: 'easeOut' };

  const textTransition = (delay) =>
    reduced
      ? { duration: 0.15 }
      : { delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-heading"
          aria-describedby="welcome-tagline"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5, ease: 'easeInOut' }}
        >
          <div className={styles.scene}>
            <div className={styles.lamp} aria-hidden="true">
              <motion.div
                className={styles.glowDown}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={glowTransition}
              />
              <motion.div
                className={styles.glowRing}
                initial={reduced ? false : { opacity: 0, width: '2rem' }}
                animate={{ opacity: 1, width: 'min(38rem, 90vw)' }}
                transition={glowTransition}
              />
              <motion.div
                className={styles.glowHalo}
                initial={reduced ? false : { opacity: 0, width: '1.5rem' }}
                animate={{ opacity: 1, width: 'min(34rem, 84vw)' }}
                transition={lineTransition}
              />
              <motion.div
                className={styles.beam}
                initial={reduced ? false : { width: '0.6rem', opacity: 0.7 }}
                animate={{ width: 'min(34rem, 84vw)', opacity: 1 }}
                transition={lineTransition}
              />
              <motion.div
                className={styles.beamCore}
                initial={reduced ? false : { width: '0.35rem', opacity: 0.5 }}
                animate={{ width: 'min(32rem, 80vw)', opacity: 1 }}
                transition={lineTransition}
              />
            </div>

            <div className={styles.copy}>
              <motion.h1
                id="welcome-heading"
                className={styles.heading}
                initial={reduced ? false : { opacity: 0, y: 72 }}
                animate={{ opacity: 1, y: 0 }}
                transition={textTransition(0.85)}
              >
                <span className={styles.headingLit}>Star Fitness</span>
              </motion.h1>

              <motion.p
                id="welcome-tagline"
                className={styles.tagline}
                initial={reduced ? false : { opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={textTransition(1.15)}
              >
               " WHERE STARS ARE MADE "
              </motion.p>
            </div>
          </div>

          <motion.div
            className={styles.footer}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={textTransition(1.3)}
          >
            <div className={styles.loopWrap}> 
            <div>
              <TextLoop
                text="Welcome to Star Fitness"
                shape="wave"
                speed={70}
                direction="forward"
                separator="✦"
                curviness={36}
                fontSize={30}
                fontWeight={600}
                letterSpacing={6}
                uppercase
                color="#0a0a0b"
                ribbon
                ribbonColor="#C89B3C"
                ribbonWidth={48}
                pauseOnHover
              />
            </div>
            {/* <div >
              <TextLoop
                text="Train Hard ✦ Stay Focused ✦ Build Strength ✦ Calm Your Mind"
                shape="wave"
                speed={70}
                direction="forward"
                separator="✦"
                curviness={36}
                fontSize={30}
                fontWeight={700}
                letterSpacing={5}
                uppercase
                color="#0a0a0b"
                ribbon
                ribbonColor="#C89B3C"
                ribbonWidth={48}
                pauseOnHover
              />
            </div> */}
            </div>
            <motion.button
              type="button"
              className={styles.enter}
              onClick={onEnter}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={textTransition(1.45)}
              whileHover={reduced ? undefined : { scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
            >
              Enter
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default WelcomeLamp;
