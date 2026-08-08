import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/utils/motion';
import styles from './LiquidButton.module.css';

const MotionButton = motion.button;
const MotionLink = motion.create(Link);

/**
 * Animate UI liquid fill — ported to CSS Modules + framer-motion (no Tailwind/TS).
 * Fills from the bottom on hover; light scale on hover/tap.
 */
const LiquidButton = ({
  label,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  to,
  className = '',
  delay = '0.3s',
  fillHeight = '3px',
  hoverScale = 1.05,
  tapScale = 0.95,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;
  const reduced = prefersReducedMotion();
  const content = children ?? label;

  const classNames = [
    styles.button,
    styles[variant] || styles.primary,
    styles[`size_${size}`] || styles.size_default,
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const liquidStyle = {
    '--liquid-button-fill-width': '-1%',
    '--liquid-button-fill-height': fillHeight,
    '--liquid-button-delay': '0s',
    background:
      'linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
    backgroundColor: 'var(--liquid-button-background-color)',
    transition: `background ${delay} var(--liquid-button-delay, 0s), color ${delay} ${delay}, background-position ${delay} calc(${delay} - var(--liquid-button-delay, 0s))`,
  };

  const motionProps = reduced
    ? {}
    : {
        whileHover: isDisabled
          ? undefined
          : {
              scale: hoverScale,
              '--liquid-button-fill-width': '100%',
              '--liquid-button-fill-height': '100%',
              '--liquid-button-delay': delay,
              transition: {
                '--liquid-button-fill-width': { duration: 0 },
                '--liquid-button-fill-height': { duration: 0 },
                '--liquid-button-delay': { duration: 0 },
              },
            },
        whileTap: isDisabled ? undefined : { scale: tapScale },
      };

  const inner = isLoading ? (
    <span className={styles.spinner} aria-hidden="true" />
  ) : (
    <>
      {Icon && iconPosition === 'left' ? (
        <Icon size={size === 'nav' ? 16 : 20} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {content != null ? <span>{content}</span> : null}
      {Icon && iconPosition === 'right' ? (
        <Icon size={size === 'nav' ? 16 : 20} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
    </>
  );

  if (to) {
    return (
      <MotionLink
        to={to}
        className={classNames}
        style={liquidStyle}
        aria-label={ariaLabel}
        {...motionProps}
        {...rest}
      >
        {inner}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type={type}
      className={classNames}
      style={liquidStyle}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-label={ariaLabel}
      {...motionProps}
      {...rest}
    >
      {inner}
    </MotionButton>
  );
};

export default LiquidButton;
