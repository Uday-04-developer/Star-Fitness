import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './AnimatedTestimonials.module.css';

/**
 * Aceternity-style stacked photo testimonials — CSS Modules + framer-motion.
 * Rotations are seeded once so cards don’t jump on every render.
 */
const AnimatedTestimonials = ({ testimonials = [], autoplay = true }) => {
  const [active, setActive] = useState(0);
  const reduced = prefersReducedMotion();

  const rotates = useMemo(
    () => testimonials.map(() => Math.floor(Math.random() * 21) - 10),
    [testimonials],
  );

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay || reduced || testimonials.length < 2) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [autoplay, reduced, testimonials.length]);

  if (!testimonials.length) {
    return null;
  }

  const current = testimonials[active];

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.photos}>
          <div className={styles.stack}>
            <AnimatePresence initial={false}>
              {testimonials.map((item, index) => {
                const isActive = index === active;
                return (
                  <motion.div
                    key={item.src}
                    className={styles.card}
                    initial={
                      reduced
                        ? false
                        : { opacity: 0, scale: 0.92, rotate: rotates[index] }
                    }
                    animate={{
                      opacity: isActive ? 1 : 0.55,
                      scale: isActive ? 1 : 0.94,
                      rotate: isActive ? 0 : rotates[index],
                      zIndex: isActive ? 40 : testimonials.length + 2 - index,
                      y: reduced || !isActive ? 0 : [0, -18, 0],
                    }}
                    exit={
                      reduced
                        ? undefined
                        : { opacity: 0, scale: 0.92, rotate: rotates[index] }
                    }
                    transition={{ duration: reduced ? 0.15 : 0.4, ease: 'easeInOut' }}
                  >
                    <img
                      src={item.src}
                      alt=""
                      className={styles.image}
                      draggable={false}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.copy}>
          <motion.div
            key={active}
            initial={reduced ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduced ? 0.12 : 0.25, ease: 'easeOut' }}
          >
            <h3 className={styles.name}>{current.name}</h3>
            <p className={styles.role}>{current.designation}</p>
            <p className={styles.quote}>
              {current.quote.split(' ').map((word, index) => (
                <motion.span
                  key={`${active}-${index}`}
                  className={styles.word}
                  initial={
                    reduced ? false : { filter: 'blur(8px)', opacity: 0, y: 4 }
                  }
                  animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.2,
                    delay: reduced ? 0 : 0.02 * index,
                    ease: 'easeOut',
                  }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </p>
          </motion.div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;
