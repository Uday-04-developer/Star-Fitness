import GlassCard from '@/components/common/GlassCard/GlassCard';
import styles from './StatCard.module.css';

const StatCard = ({ label, value, icon: Icon, accent = false }) => {
  return (
    <GlassCard
      padding="md"
      className={[styles.card, accent ? styles.accent : ''].filter(Boolean).join(' ')}
    >
      <div className={styles.top}>
        <p className={styles.label}>{label}</p>
        {Icon ? (
          <span className={styles.icon} aria-hidden="true">
            <Icon size={20} strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      <p className={styles.value}>{value}</p>
    </GlassCard>
  );
};

export default StatCard;
