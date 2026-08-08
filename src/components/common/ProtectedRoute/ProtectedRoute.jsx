import { Navigate, useLocation } from 'react-router-dom';
import Loader from '@/components/common/Loader/Loader';
import { useAuth } from '@/context/AuthContext';
import styles from './ProtectedRoute.module.css';

const ProtectedRoute = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Loader size="lg" label="Checking sign-in" />
      </div>
    );
  }

  if (!session) {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
