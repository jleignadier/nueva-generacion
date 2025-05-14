
import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/contexts/AuthContext';

const UserLayout = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("UserLayout mounted, user:", user?.email, "isAdmin:", user?.isAdmin);
  }, [user]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    console.log("UserLayout: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If admin trying to access user area, redirect to admin
  if (user.isAdmin) {
    console.log("UserLayout: Admin user detected, redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-auto pb-16">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
};

export default UserLayout;
