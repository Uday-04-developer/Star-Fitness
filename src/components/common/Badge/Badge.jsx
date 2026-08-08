import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';
import styles from './Badge.module.css';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'active',
    icon: CheckCircle2,
  },
  expiring_soon: {
    label: 'Expiring Soon',
    className: 'expiring',
    icon: AlertTriangle,
  },
  expired: {
    label: 'Expired',
    className: 'expired',
    icon: XCircle,
  },
  neutral: {
    label: 'Neutral',
    className: 'neutral',
    icon: MinusCircle,
  },
};

const Badge = ({ label, status = 'neutral' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.neutral;
  const Icon = config.icon;
  const text = label || config.label;

  return (
    <span className={[styles.badge, styles[config.className]].join(' ')}>
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
};

export default Badge;
