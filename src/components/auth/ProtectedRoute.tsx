import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PlayfulCard, PlayfulButton } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { ShieldAlert, Lock, ArrowLeft, Home } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['user', 'admin'],
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-periwinkle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet border-t-transparent rounded-full animate-spin" />
          <span className="font-jakarta text-navy">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if current path is a survey route - allow access without authentication
  if (location.pathname.startsWith('/survey')) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      {children}
    </ProtectedRoute>
  );
};

const AccessDeniedPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle flex items-center justify-center p-4">
      {/* Background */}
      <DotGrid className="fixed inset-0" />
      <DecorativeBlob variant="pink" size="lg" className="left-[10%] top-[20%] opacity-40" />
      <DecorativeBlob variant="yellow" size="md" className="right-[15%] bottom-[20%] opacity-40" />

      {/* Content */}
      <PlayfulCard className="relative z-10 w-full max-w-md p-8 text-center animate-bounce-in">
        <div className="flex justify-center mb-5">
          <BrandLogo size="sm" className="mx-auto max-h-10" />
        </div>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <IconCircle variant="pink" size="xl">
              <ShieldAlert className="w-10 h-10" />
            </IconCircle>
            <div className="absolute -bottom-2 -right-2">
              <IconCircle variant="violet" size="sm">
                <Lock className="w-4 h-4" />
              </IconCircle>
            </div>
          </div>
        </div>

        <h1 className="font-outfit font-bold text-3xl text-navy mb-3">
          Access Denied 🚫
        </h1>

        <p className="font-jakarta text-navy-light mb-2">
          Oops! You don't have permission to access this page.
        </p>

        {user && (
          <p className="font-mono text-sm text-violet mb-6">
            Logged in as: {user.name} ({user.role})
          </p>
        )}

        <div className="space-y-3">
          <PlayfulButton
            variant="primary"
            className="w-full"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => window.location.href = user?.role === 'admin' ? '/admin' : '/dashboard'}
          >
            Go to {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
          </PlayfulButton>

          <PlayfulButton
            variant="secondary"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={logout}
          >
            Logout
          </PlayfulButton>
        </div>

        {/* Decorative */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow border-2 border-navy rounded-full animate-float" />
        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-green border-2 border-navy rounded-full animate-float animation-delay-300" />
      </PlayfulCard>
    </div>
  );
};

export default ProtectedRoute;
