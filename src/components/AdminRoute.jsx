import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.is_admin !== true) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
