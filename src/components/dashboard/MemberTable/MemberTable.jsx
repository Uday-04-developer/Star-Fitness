import MemberRow from '@/components/dashboard/MemberRow/MemberRow';
import styles from './MemberTable.module.css';

const SKELETON_ROWS = 6;

const MemberTable = ({ members, isLoading, onSelectMember }) => {
  if (isLoading) {
    return (
      <div className={styles.wrap} aria-busy="true" aria-label="Loading members">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Status</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <tr key={`skeleton-${index}`} className={styles.skeletonRow}>
                <td><span className={styles.skeleton} /></td>
                <td><span className={styles.skeleton} /></td>
                <td><span className={styles.skeleton} /></td>
                <td><span className={styles.skeletonShort} /></td>
                <td><span className={styles.skeleton} /></td>
                <td><span className={styles.skeletonShort} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className={styles.empty}>
        <h3 className={styles.emptyTitle}>No members yet</h3>
        <p className={styles.emptyCopy}>
          Register your first member to see them appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Plan</th>
            <th>Status</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onClick={onSelectMember}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;
