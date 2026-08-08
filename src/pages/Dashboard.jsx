import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LogOut,
  UserPlus,
} from 'lucide-react';
import Button from '@/components/common/Button/Button';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import StatCard from '@/components/dashboard/StatCard/StatCard';
import FilterBar from '@/components/dashboard/FilterBar/FilterBar';
import SearchInput from '@/components/dashboard/SearchInput/SearchInput';
import MemberCardGrid from '@/components/dashboard/MemberCardGrid/MemberCardGrid';
import { useAuth } from '@/context/AuthContext';
import { useMembers } from '@/hooks/useMembers';
import { getMembershipStatus } from '@/utils/date';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { members, isLoading, error, refetch, updatePaymentStatus, renewMembership, removeMember } =
    useMembers();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard — Star Fitness';
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: members.length,
      active: 0,
      expiring_soon: 0,
      expired: 0,
    };

    members.forEach((member) => {
      const status = getMembershipStatus(member);
      counts[status] += 1;
    });

    return counts;
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const status = getMembershipStatus(member);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const matchesSearch =
        !query ||
        member.full_name.toLowerCase().includes(query) ||
        member.phone_number.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [members, activeFilter, searchQuery]);

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
          isLoading={isLoading}
          onPaymentStatusChange={updatePaymentStatus}
          onRenewMember={renewMembership}
          onDeleteMember={removeMember}
        />
      </main>
    </div>
  );
};

export default Dashboard;
