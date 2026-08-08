import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button/Button';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page not found — Star Fitness';
  }, []);

  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.copy}>
        That link does not lead anywhere in Star Fitness.
      </p>
      <Button label="Back to Home" onClick={() => navigate('/')} />
    </main>
  );
};

export default NotFound;
