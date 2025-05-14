
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/contexts/AuthContext';

const UserLayout = () => {
  const { user, isLoading } = useAuth();
  
  // While loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin trying to access user area, redirect to admin
  if (user.isAdmin) {
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
