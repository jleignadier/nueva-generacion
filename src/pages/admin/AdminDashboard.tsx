
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminTabBar } from '@/components/AdminTabBar';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug admin dashboard state
  console.log("AdminDashboard - Current state:", { 
    user, 
    isAdmin: user?.isAdmin, 
    currentPath: location.pathname 
  });

  // Ensure initial admin route is set correctly
  useEffect(() => {
    if (user?.isAdmin) {
      // If we're at the base admin path, no need to navigate
      if (location.pathname === '/admin') {
        console.log("AdminDashboard - At admin root, staying here");
      }
    } else if (user) {
      // If user exists but is not admin, redirect to user dashboard
      console.log("AdminDashboard - Not admin, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <div className="flex-1 overflow-auto pb-16">
        <div className="max-w-md mx-auto px-4 py-6">
          <Outlet />
        </div>
      </div>
      <AdminTabBar />
    </div>
  );
};

export default AdminDashboard;
