import styles from './Button.module.css';

const Button = ({
  label,
  onClick,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  isLoading = false,
  type = 'button',
  fullWidth = false,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        isLoading ? styles.loading : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        Icon && iconPosition === 'left' && (
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        )
      )}
      <span>{label}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
};

export default Button;
