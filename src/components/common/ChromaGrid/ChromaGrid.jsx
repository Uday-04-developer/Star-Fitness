import { Children, cloneElement, isValidElement, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './ChromaGrid.module.css';

/**
 * React Bits ChromaGrid — CSS Modules port.
 * Supports either `items` (default cards) or `children` (e.g. MemberFlipCard).
 * Spotlight stays on the hovered card until the pointer leaves that card
 * (and the grid) — not when native selects briefly detach the pointer.
 */
const ChromaGrid = ({
  items,
  children,
  className = '',
  radius = 300,
  columns = 3,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onItemClick,
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const activeSlotRef = useRef(null);
  const leaveTimerRef = useRef(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) {
      return undefined;
    }

    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    return undefined;
  }, [reduced, items, children]);

  useEffect(
    () => () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    },
    [],
  );

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const reveal = () => {
    if (reduced) {
      return;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const dim = () => {
    if (reduced) {
      return;
    }
    activeSlotRef.current = null;
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const scheduleDim = () => {
    if (reduced) {
      return;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    // Native <select> can fire leave with null relatedTarget; wait briefly.
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      if (!activeSlotRef.current) {
        dim();
      }
    }, 180);
  };

  const pointerInRoot = (clientX, clientY) => {
    const el = rootRef.current;
    if (!el) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  const handleMove = (event) => {
    if (reduced || !rootRef.current) {
      return;
    }
    const rect = rootRef.current.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    reveal();
  };

  const handleSlotEnter = (event) => {
    activeSlotRef.current = event.currentTarget;
    handleMove(event);
  };

  const handleSlotLeave = (event) => {
    const { relatedTarget, currentTarget } = event;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    if (relatedTarget && rootRef.current?.contains(relatedTarget)) {
      // Moving to another card in the grid — stay revealed; other enter updates.
      if (activeSlotRef.current === currentTarget) {
        activeSlotRef.current = null;
      }
      return;
    }

    if (activeSlotRef.current === currentTarget) {
      activeSlotRef.current = null;
    }

    if (!relatedTarget) {
      scheduleDim();
      return;
    }

    dim();
  };

  const handleGridLeave = (event) => {
    const { relatedTarget } = event;
    if (relatedTarget && rootRef.current?.contains(relatedTarget)) {
      return;
    }
    activeSlotRef.current = null;
    if (!relatedTarget) {
      scheduleDim();
      return;
    }
    dim();
  };

  useEffect(() => {
    if (reduced) {
      return undefined;
    }

    const onWindowBlur = () => {
      activeSlotRef.current = null;
      dim();
    };

    const onPointerDown = (event) => {
      if (!pointerInRoot(event.clientX, event.clientY)) {
        activeSlotRef.current = null;
        dim();
      }
    };

    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [reduced, fadeOut]);

  const handleCardClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
      return;
    }
    if (item?.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  };

  const rootClass = [styles.grid, className].filter(Boolean).join(' ');

  const wrappedChildren = children
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        const existingClass = child.props.className || '';
        return cloneElement(child, {
          className: [existingClass, styles.slot].filter(Boolean).join(' '),
          onPointerEnter: (event) => {
            child.props.onPointerEnter?.(event);
            handleSlotEnter(event);
          },
          onPointerLeave: (event) => {
            child.props.onPointerLeave?.(event);
            handleSlotLeave(event);
          },
          onPointerMove: (event) => {
            child.props.onPointerMove?.(event);
            handleMove(event);
          },
          key: child.key ?? index,
        });
      })
    : null;

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={{
        '--r': `${radius}px`,
        '--cols': columns,
      }}
      onPointerLeave={handleGridLeave}
    >
      {wrappedChildren
        ? wrappedChildren
        : (items || []).map((item, index) => (
            <article
              key={item.id || item.title || index}
              className={styles.card}
              onPointerEnter={handleSlotEnter}
              onPointerLeave={handleSlotLeave}
              onPointerMove={(event) => {
                handleMove(event);
                handleCardMove(event);
              }}
              onClick={() => handleCardClick(item)}
              style={{
                '--card-border': item.borderColor || 'transparent',
                '--card-gradient':
                  item.gradient || 'linear-gradient(145deg, #1b1b1f, #0a0a0b)',
                cursor: item.url || onItemClick ? 'pointer' : 'default',
              }}
            >
              <div className={styles.imgWrap}>
                <img src={item.image} alt={item.title || ''} loading="lazy" />
              </div>
              <footer className={styles.info}>
                <h3 className={styles.name}>{item.title}</h3>
                {item.handle ? (
                  <span className={styles.handle}>{item.handle}</span>
                ) : null}
                <p className={styles.role}>{item.subtitle}</p>
                {item.location ? (
                  <span className={styles.location}>{item.location}</span>
                ) : null}
              </footer>
            </article>
          ))}

      {!reduced ? (
        <>
          <div className={styles.overlay} aria-hidden="true" />
          <div ref={fadeRef} className={styles.fade} aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
};

export default ChromaGrid;
