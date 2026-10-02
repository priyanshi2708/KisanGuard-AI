import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardMobileNav from './DashboardMobileNav';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { getFarmerProfile } from '../../services/farmerProfileService';

export const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // ProtectedRoute handles the auth gate — DashboardLayout trusts that
    // the user is authenticated at this point. This secondary check is
    // only a safety net for edge cases.
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user && user.id) {
      const p = getFarmerProfile(user.id);
      if (p && !p.error) {
        setProfile(p);
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Let ProtectedRoute handle the loading / unauthenticated state
  if (!user) {
    return null;
  }

  const farmerName = profile?.name || user?.name || 'Kisan';
  const village = profile?.village || '';
  const district = profile?.district || '';

  return (
    <div className="min-h-screen bg-warm-cream flex font-sans text-deep-forest overflow-x-hidden">

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <DashboardHeader
          farmerName={farmerName}
          village={village}
          district={district}
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Mobile Touch Bottom Nav */}
      <DashboardMobileNav />

    </div>
  );
};

export default DashboardLayout;
