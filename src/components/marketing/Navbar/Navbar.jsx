import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { animate } from 'framer-motion';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';
import SpotlightNavbar from '@/components/marketing/Navbar/SpotlightNavbar';
import { MOTION } from '@/lib/constants';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './Navbar.module.css';

const SCROLL_THRESHOLD = 24;

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About', end: false },
  { to: '/login', label: 'Staff', end: false },
  { to: '/register', label: 'Join Now', end: false, liquid: true },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoverX, setHoverX] = useState(null);
  const menuId = useId();
  const headerRef = useRef(null);
  const shellRef = useRef(null);
  const spotlightX = useRef(0);
  const menuButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    let frameId = 0;

    const updateScrolled = () => {
      frameId = 0;
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const targets = headerRef.current?.querySelectorAll('[data-nav-animate]');
      if (!targets?.length) {
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: reduced ? 0 : -12 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? MOTION.reducedFade : 0.45,
          stagger: reduced ? 0 : 0.06,
          ease: MOTION.easeOut,
          clearProps: 'transform',
        },
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || prefersReducedMotion()) {
      return undefined;
    }

    const getActiveCenterX = () => {
      const active = shell.querySelector('[data-nav-index][aria-current="page"]');
      if (!active) {
        const first = shell.querySelector('[data-nav-index="0"]');
        if (!first) {
          return shell.clientWidth / 2;
        }
        const shellRect = shell.getBoundingClientRect();
        const itemRect = first.getBoundingClientRect();
        return itemRect.left - shellRect.left + itemRect.width / 2;
      }
      const shellRect = shell.getBoundingClientRect();
      const itemRect = active.getBoundingClientRect();
      return itemRect.left - shellRect.left + itemRect.width / 2;
    };

    const handleMouseMove = (event) => {
      const rect = shell.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      shell.style.setProperty('--spotlight-x', `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      const targetX = getActiveCenterX();

      animate(spotlightX.current, targetX, {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        onUpdate: (value) => {
          spotlightX.current = value;
          shell.style.setProperty('--spotlight-x', `${value}px`);
        },
      });
    };

    shell.addEventListener('mousemove', handleMouseMove);
    shell.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      shell.removeEventListener('mousemove', handleMouseMove);
      shell.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const panel = mobilePanelRef.current;
    if (!panel || !isMenuOpen) {
      return undefined;
    }

    const reduced = prefersReducedMotion();
    const items = panel.querySelectorAll('[data-mobile-item]');
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: reduced ? 0 : 10 },
      {
        opacity: 1,
        y: 0,
        duration: reduced ? MOTION.reducedFade : 0.32,
        stagger: reduced ? 0 : 0.05,
        ease: MOTION.easeOut,
      },
    );

    return () => {
      tween.kill();
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={[
        styles.header,
        isScrolled ? styles.scrolled : '',
        isMenuOpen ? styles.menuOpen : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={shellRef}
        className={styles.shell}
        style={{
          '--spotlight-x': `${spotlightX.current || 0}px`,
          '--ambience-x': '50%',
        }}
      >
        <div
          className={styles.spotlight}
          style={{ opacity: hoverX !== null ? 1 : 0 }}
          aria-hidden="true"
        />
        <div className={styles.ambience} aria-hidden="true" />

        <nav className={styles.nav} aria-label="Primary">
          <Link
            to="/"
            className={styles.logo}
            data-nav-animate
            onClick={handleNavClick}
          >
            <span className={styles.logoMark} aria-hidden="true" />
            <span className={styles.logoText}>
              Star <span className={styles.logoAccent}>Fitness</span>
            </span>
          </Link>

          <div className={styles.desktopLinks} data-nav-animate>
            <SpotlightNavbar items={NAV_ITEMS} surfaceRef={shellRef} />
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={handleToggleMenu}
          >
            {isMenuOpen ? (
              <X size={22} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      <div
        ref={mobilePanelRef}
        id={menuId}
        className={[styles.mobilePanel, isMenuOpen ? styles.mobilePanelOpen : '']
          .filter(Boolean)
          .join(' ')}
        hidden={!isMenuOpen}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            data-mobile-item
            className={({ isActive }) =>
              [
                styles.mobileLink,
                item.liquid ? styles.mobileLinkEmphasis : '',
                isActive ? styles.mobileLinkActive : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
            onClick={handleNavClick}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
