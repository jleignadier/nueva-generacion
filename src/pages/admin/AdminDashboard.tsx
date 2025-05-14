
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminTabBar } from '@/components/AdminTabBar';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ensure user remains in admin section
  useEffect(() => {
    if (user?.isAdmin && location.pathname === '/admin') {
      // We're already at /admin base path, no need to navigate
    }
  }, [location, navigate, user]);

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
