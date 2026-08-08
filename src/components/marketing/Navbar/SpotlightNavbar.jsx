import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { animate } from 'framer-motion';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './SpotlightNavbar.module.css';

/**
 * Link row for the header spotlight surface.
 * Spotlight layers live on the parent shell — this only renders the items.
 */
const SpotlightNavbar = ({ items = [], surfaceRef = null }) => {
  const listRef = useRef(null);
  const ambienceX = useRef(0);
  const location = useLocation();

  const activeIndex = Math.max(
    0,
    items.findIndex((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    ),
  );

  const getItemCenterX = (index) => {
    const surface = surfaceRef?.current;
    if (!surface) {
      return 0;
    }
    const item = surface.querySelector(`[data-nav-index="${index}"]`);
    if (!item) {
      return surface.clientWidth / 2;
    }
    const surfaceRect = surface.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return itemRect.left - surfaceRect.left + itemRect.width / 2;
  };

  useEffect(() => {
    const surface = surfaceRef?.current;
    if (!surface) {
      return undefined;
    }

    const targetX = getItemCenterX(activeIndex);
    const reduced = prefersReducedMotion();

    if (reduced) {
      ambienceX.current = targetX;
      surface.style.setProperty('--ambience-x', `${targetX}px`);
      if (!surface.style.getPropertyValue('--spotlight-x')) {
        surface.style.setProperty('--spotlight-x', `${targetX}px`);
      }
      return undefined;
    }

    const controls = animate(ambienceX.current, targetX, {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      onUpdate: (value) => {
        ambienceX.current = value;
        surface.style.setProperty('--ambience-x', `${value}px`);
      },
    });

    return () => {
      controls.stop();
    };
  }, [activeIndex, surfaceRef]);

  return (
    <ul ref={listRef} className={styles.list} aria-label="Section">
      {items.map((item, index) => (
        <li key={item.to} className={styles.item}>
          {item.liquid ? (
            <LiquidButton
              to={item.to}
              label={item.label}
              variant="solid"
              size="nav"
              data-nav-index={index}
              hoverScale={1.03}
            />
          ) : (
            <NavLink
              to={item.to}
              end={item.end}
              data-nav-index={index}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {item.label}
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
};

export default SpotlightNavbar;
