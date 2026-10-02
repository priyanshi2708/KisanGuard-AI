/**
 * KisanGuard AI — ProtectedRoute
 *
 * Guards all dashboard and authenticated routes.
 * Unauthenticated users are redirected to /login.
 * While auth state is resolving (loading=true), a spinner is shown to
 * prevent a flash of content or premature redirect.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show a minimal spinner while backend resolves the initial auth state.
  // This prevents premature redirect to /login on page refresh.
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-forest-green border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-earth-brown animate-pulse">
            Loading KisanGuard AI…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
