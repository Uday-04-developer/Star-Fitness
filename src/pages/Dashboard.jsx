import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LogOut,
  UserPlus,
  Download,
} from 'lucide-react';
import Button from '@/components/common/Button/Button';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import Modal from '@/components/common/Modal/Modal';
import StatCard from '@/components/dashboard/StatCard/StatCard';
import FilterBar from '@/components/dashboard/FilterBar/FilterBar';
import SearchInput from '@/components/dashboard/SearchInput/SearchInput';
import MemberCardGrid from '@/components/dashboard/MemberCardGrid/MemberCardGrid';
import { useAuth } from '@/context/AuthContext';
import { useMembers, MEMBERS_PAGE_SIZE } from '@/hooks/useMembers';
import {
  BackupExportError,
  downloadMembersBackup,
} from '@/utils/backupExport';
import { getMembershipStatus } from '@/utils/date';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    members,
    stats,
    isLoading,
    isLoadingMore,
    isSearching,
    isSearchMode,
    searchCapped,
    hasMore,
    error,
    refetch,
    loadMore,
    searchMembers,
    updatePaymentStatus,
    renewMembership,
    removeMember,
  } = useMembers();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [exportError, setExportError] = useState('');
  const [exportSummary, setExportSummary] = useState(null);
  const exportCancelRef = useRef({ cancelled: false });

  useEffect(() => {
    document.title = 'Dashboard — Star Fitness';
  }, []);

  useEffect(
    () => () => {
      exportCancelRef.current.cancelled = true;
    },
    [],
  );

  // SearchInput already debounces ~300ms before onChange.
  useEffect(() => {
    searchMembers(searchQuery);
  }, [searchQuery, searchMembers]);

  // Status filter stays client-side on the current browse/search result set.
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const status = getMembershipStatus(member);
      return activeFilter === 'all' || status === activeFilter;
    });
  }, [members, activeFilter]);

  const gridIsEmpty = filteredMembers.length === 0;
  const serverHasRows = members.length > 0;

  let gridEmptyTitle = 'No members yet';
  let gridEmptyCopy =
    'Register your first member to see their card here.';

  if (gridIsEmpty) {
    if (isSearchMode && !serverHasRows) {
      gridEmptyTitle = 'No members match';
      gridEmptyCopy = 'Try another name or phone number.';
    } else if (serverHasRows && activeFilter !== 'all') {
      gridEmptyTitle = 'No members match';
      gridEmptyCopy =
        'No members in this result set match the selected status filter.';
    } else if (isSearchMode) {
      gridEmptyTitle = 'No members match';
      gridEmptyCopy = 'Try another name or phone number.';
    }
  }

  const showBrowseLoadMore = !isLoading && !isSearchMode && !isSearching && hasMore;
  const showSearchCapNote =
    isSearchMode && !isSearching && searchCapped && filteredMembers.length > 0;
  const handleRegister = () => {
    window.open('/register', '_blank', 'noopener,noreferrer');
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      setIsSigningOut(false);
    }
  };

  const handleOpenExport = () => {
    if (isExporting) {
      return;
    }
    setExportError('');
    setExportSummary(null);
    setExportProgress('');
    setIsExportOpen(true);
  };

  const handleCloseExport = () => {
    if (isExporting) {
      return;
    }
    setIsExportOpen(false);
    setExportError('');
    setExportSummary(null);
    setExportProgress('');
  };

  const handleConfirmExport = async () => {
    if (isExporting) {
      return;
    }

    exportCancelRef.current = { cancelled: false };
    setIsExporting(true);
    setExportError('');
    setExportSummary(null);
    setExportProgress('Preparing backup...');

    try {
      const summary = await downloadMembersBackup({
        signal: exportCancelRef.current,
        onProgress: ({ message }) => {
          setExportProgress(message);
        },
      });
      setExportSummary(summary);
      setExportProgress(
        summary.selfieMissing > 0
          ? `Backup completed with ${summary.selfieMissing} missing photo${summary.selfieMissing === 1 ? '' : 's'}.`
          : 'Backup complete.',
      );
    } catch (err) {
      console.error(err);
      if (err instanceof BackupExportError && err.code === 'cancelled') {
        setExportError('');
        setExportProgress('');
      } else if (err instanceof BackupExportError) {
        setExportError(err.message);
      } else {
        setExportError('Backup could not be prepared. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            Star <span className={styles.logoAccent}>Fitness</span>
          </Link>
          <p className={styles.owner}>Admin · Lokesh Verma</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            label="Export Backup"
            variant="secondary"
            icon={Download}
            onClick={handleOpenExport}
            disabled={isExporting}
            isLoading={isExporting}
          />
          <LiquidButton
            label="Register Member"
            icon={UserPlus}
            onClick={handleRegister}
            variant="solid"
          />
          <Button
            label="Logout"
            variant="ghost"
            icon={LogOut}
            onClick={handleLogout}
            isLoading={isSigningOut}
          />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Members</h1>
            <p className={styles.subtitle}>
              Tap a card for phone, plan, and WhatsApp reminder. Flip back anytime.
            </p>
          </div>
        </div>

        {error ? (
          <div className={styles.errorBanner} role="alert">
            <p>{error}</p>
            <Button label="Retry" variant="secondary" onClick={refetch} />
          </div>
        ) : null}

        <section className={styles.stats} aria-label="Membership summary">
          {isLoading ? (
            <>
              <div className={styles.statSkeleton} aria-hidden="true" />
              <div className={styles.statSkeleton} aria-hidden="true" />
              <div className={styles.statSkeleton} aria-hidden="true" />
              <div className={styles.statSkeleton} aria-hidden="true" />
            </>
          ) : (
            <>
              <StatCard label="Total Members" value={stats.total} icon={Users} />
              <StatCard label="Active" value={stats.active} icon={CheckCircle2} />
              <StatCard
                label="Expiring Soon"
                value={stats.expiring_soon}
                icon={AlertTriangle}
                accent
              />
              <StatCard label="Expired" value={stats.expired} icon={XCircle} />
            </>
          )}
        </section>

        <section className={styles.controls} aria-label="Filter and search">
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </section>

        <MemberCardGrid
          members={filteredMembers}
          isLoading={isLoading || isSearching}
          emptyTitle={gridEmptyTitle}
          emptyCopy={gridEmptyCopy}
          onPaymentStatusChange={updatePaymentStatus}
          onRenewMember={renewMembership}
          onDeleteMember={removeMember}
        />

        {showSearchCapNote ? (
          <p className={styles.searchNote} role="status">
            Showing up to {MEMBERS_PAGE_SIZE} matches. Refine your search if you
            need a more specific result.
          </p>
        ) : null}

        {showBrowseLoadMore ? (
          <div className={styles.loadMore}>
            {activeFilter !== 'all' ? (
              <p className={styles.loadMoreHint}>
                Status filter applies to loaded members. Load more to include
                older registrations.
              </p>
            ) : null}
            <Button
              label="Load more"
              variant="secondary"
              onClick={loadMore}
              isLoading={isLoadingMore}
              disabled={isLoadingMore}
            />
          </div>
        ) : null}
      </main>

      <Modal
        isOpen={isExportOpen}
        onClose={handleCloseExport}
        title={exportSummary ? 'Backup ready' : 'Export backup?'}
      >
        {exportSummary ? (
          <>
            <p className={styles.modalCopy}>{exportProgress}</p>
            <ul className={styles.exportSummary}>
              <li>File: {exportSummary.zipFileName}</li>
              <li>Members: {exportSummary.memberCount}</li>
              <li>Photos saved: {exportSummary.selfieDownloaded}</li>
              <li>Photos missing: {exportSummary.selfieMissing}</li>
            </ul>
            <div className={styles.modalActions}>
              <Button label="Done" variant="primary" onClick={handleCloseExport} />
            </div>
          </>
        ) : (
          <>
            <p className={styles.modalCopy}>
              This backup contains private member information and photos. Download
              it only to a secure device and do not share it publicly.
            </p>
            {isExporting ? (
              <p className={styles.exportProgress} aria-live="polite">
                {exportProgress || 'Preparing backup...'}
              </p>
            ) : null}
            {exportError ? (
              <p className={styles.modalError} role="alert">
                {exportError}
              </p>
            ) : null}
            <div className={styles.modalActions}>
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleCloseExport}
                disabled={isExporting}
              />
              <Button
                label="Export Backup"
                variant="primary"
                icon={Download}
                onClick={handleConfirmExport}
                isLoading={isExporting}
                disabled={isExporting}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
