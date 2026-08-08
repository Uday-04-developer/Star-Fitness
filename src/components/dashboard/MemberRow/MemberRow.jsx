import Badge from '@/components/common/Badge/Badge';
import WhatsAppButton from '@/components/dashboard/WhatsAppButton/WhatsAppButton';
import {
  formatDisplayDate,
  formatPlanLabel,
  getMembershipStatus,
  getPlanEndDate,
} from '@/utils/date';
import { getReminderMessage } from '@/utils/whatsapp';
import styles from './MemberRow.module.css';

const MemberRow = ({ member, onClick }) => {
  const status = getMembershipStatus(member);
  const endDate = getPlanEndDate(member);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(member);
    }
  };

  return (
    <tr
      className={styles.row}
      onClick={() => onClick?.(member)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`Open member card for ${member.full_name}`}
    >
      <td className={styles.nameCell}>
        <span className={styles.name}>{member.full_name}</span>
      </td>
      <td>{member.phone_number}</td>
      <td>{formatPlanLabel(member.plan_type)}</td>
      <td>
        <Badge status={status} />
      </td>
      <td>{formatDisplayDate(endDate)}</td>
      <td className={styles.actions}>
        <WhatsAppButton
          phoneNumber={member.phone_number}
          message={getReminderMessage(member)}
          memberId={member.id}
          label="Remind"
        />
      </td>
    </tr>
  );
};

export default MemberRow;
