import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute/ProtectedRoute';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MemberCard from '@/pages/MemberCard';
import NotFound from '@/pages/NotFound';

const App = () => {
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
