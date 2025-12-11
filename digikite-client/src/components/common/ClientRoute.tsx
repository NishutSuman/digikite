import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import ClientLayout from '../client/ClientLayout';

interface ClientRouteProps {
  children: React.ReactNode;
}

export default function ClientRoute({ children }: ClientRouteProps) {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect admins to admin dashboard
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Allow USER role to access user portal
  return <ClientLayout>{children}</ClientLayout>;
}
