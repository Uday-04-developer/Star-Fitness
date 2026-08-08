import styles from './Input.module.css';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error = '',
  placeholder = '',
  required = false,
  disabled = false,
}) => {
  const inputId = `input-${name}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </label>
      <input
        id={inputId}
        className={[styles.input, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error ? (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
