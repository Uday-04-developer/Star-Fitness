import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute/ProtectedRoute';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MemberCard from '@/pages/MemberCard';
import NotFound from '@/pages/NotFound';

const MissingConfig = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: '#0a0a0b',
      color: '#f5f5f5',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
    }}
  >
    <div style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
        Missing Supabase config
      </h1>
      <p style={{ color: '#a3a3a3', lineHeight: 1.5, marginBottom: '1rem' }}>
        Set <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> in your host (Vercel → Project →
        Settings → Environment Variables), then redeploy. Vite only reads these
        at build time.
      </p>
    </div>
  </div>
);

const App = () => {
  if (!isSupabaseConfigured) {
    return <MissingConfig />;
  }

  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/member/:id"
            element={
              <ProtectedRoute>
                <MemberCard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
