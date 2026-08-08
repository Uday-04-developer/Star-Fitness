import styles from './GlassCard.module.css';

const paddingClass = {
  sm: 'paddingSm',
  md: 'paddingMd',
  lg: 'paddingLg',
};

const GlassCard = ({ children, padding = 'md', interactive = false, className = '' }) => {
  return (
    <div
      className={[
        styles.card,
        styles[paddingClass[padding] || 'paddingMd'],
        interactive ? styles.interactive : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

export default GlassCard;
