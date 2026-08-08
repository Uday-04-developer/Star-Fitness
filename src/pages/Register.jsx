import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import RegistrationForm from '@/components/registration/RegistrationForm/RegistrationForm';
import SuccessScreen from '@/components/registration/SuccessScreen/SuccessScreen';
import styles from './Register.module.css';

const Register = () => {
  const [createdMember, setCreatedMember] = useState(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    document.title = 'Register — Star Fitness Gym';
  }, []);

  const handleSuccess = (member, submitWarning = '') => {
    setCreatedMember(member);
    setWarning(submitWarning);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Star <span className={styles.logoAccent}>Fitness</span>
        </Link>
      </header>

      <main className={styles.main}>
        <GlassCard padding="lg" className={styles.card}>
          {createdMember ? (
            <SuccessScreen
              member={createdMember}
              warning={warning}
              key={createdMember.id}
            />
          ) : (
            <>
              <div className={styles.intro}>
                <h1 className={styles.title}>Join Star Fitness</h1>
                <p className={styles.copy}>
                  Fill in your details, choose a plan, and you are ready to train.
                </p>
              </div>
              <RegistrationForm onSuccess={handleSuccess} />
            </>
          )}
        </GlassCard>
      </main>
    </div>
  );
};

export default Register;
