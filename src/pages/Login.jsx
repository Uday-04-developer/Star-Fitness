import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button/Button';
import GlassCard from '@/components/common/GlassCard/GlassCard';
import Input from '@/components/common/Input/Input';
import { useAuth } from '@/context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const { session, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Login — Star Fitness';
  }, []);

  if (!isLoading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Incorrect email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <GlassCard padding="lg" className={styles.card}>
        <Link to="/" className={styles.logo}>
          Star <span className={styles.logoAccent}>Fitness</span>
        </Link>
        <h1 className={styles.title}>Owner login</h1>
        <p className={styles.copy}>Sign in to manage members and reminders.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}

          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@email.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Your password"
          />

          <Button
            type="submit"
            label="Sign In"
            fullWidth
            isLoading={isSubmitting}
          />
        </form>
      </GlassCard>
    </div>
  );
};

export default Login;
