import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import styles from './SearchInput.module.css';

const DEBOUNCE_MS = 300;

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search by name or phone',
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localValue !== value) {
        onChange?.(localValue);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <label className={styles.wrap}>
      <span className="sr-only">Search members</span>
      <Search size={18} strokeWidth={1.75} className={styles.icon} aria-hidden="true" />
      <input
        className={styles.input}
        type="search"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};

export default SearchInput;
