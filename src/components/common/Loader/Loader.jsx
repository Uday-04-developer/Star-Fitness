import styles from './Loader.module.css';

const SIZE = {
  sm: 18,
  md: 28,
  lg: 40,
};

const Loader = ({ size = 'md', label = 'Loading' }) => {
  const px = SIZE[size] || SIZE.md;

  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label={label}>
      <span
        className={styles.spinner}
        style={{ width: px, height: px }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Loader;
