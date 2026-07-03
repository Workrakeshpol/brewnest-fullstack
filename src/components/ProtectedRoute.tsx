import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'barista' | 'manager';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && role !== requireRole && role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg pt-20">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-text">Access Denied</h1>
          <p className="mt-2 text-text-muted">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
