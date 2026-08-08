import { PLAN_DURATIONS } from '@/lib/constants';
import styles from './PlanSelector.module.css';

const PLANS = [
  {
    id: 'monthly',
    title: 'Monthly',
    durationLabel: `${PLAN_DURATIONS.monthly} days`,
    priceHint: 'From ₹999',
  },
  {
    id: 'quarterly',
    title: 'Quarterly',
    durationLabel: `${PLAN_DURATIONS.quarterly} days`,
    priceHint: 'From ₹2,999',
  },
  {
    id: 'half_yearly',
    title: 'Half-Yearly',
    durationLabel: `${PLAN_DURATIONS.half_yearly} days`,
    priceHint: 'From ₹3,999',
  },
  {
    id: 'yearly',
    title: 'Yearly',
    durationLabel: `${PLAN_DURATIONS.yearly} days`,
    priceHint: 'From ₹8,999',
  },
];

const PlanSelector = ({ selectedPlan, onChange, error = '' }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} role="radiogroup" aria-label="Membership plan">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={[styles.card, isSelected ? styles.selected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange?.(plan.id)}
            >
              <span className={styles.title}>{plan.title}</span>
              <span className={styles.duration}>{plan.durationLabel}</span>
              <span className={styles.price}>{plan.priceHint}</span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default PlanSelector;
