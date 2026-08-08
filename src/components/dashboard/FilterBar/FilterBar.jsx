import styles from './FilterBar.module.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'expiring_soon', label: 'Expiring Soon' },
  { id: 'expired', label: 'Expired' },
];

const FilterBar = ({ activeFilter, onFilterChange }) => {
  return (
    <div className={styles.bar} role="group" aria-label="Filter members by status">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            className={[styles.pill, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onFilterChange?.(filter.id)}
            aria-pressed={isActive}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
