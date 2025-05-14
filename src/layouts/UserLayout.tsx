
import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/contexts/AuthContext';

const UserLayout = () => {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('UserLayout rendered', { 
      user: user?.email, 
      isAdmin: user?.isAdmin, 
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);
  
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
    console.log("UserLayout: User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If admin trying to access user area, redirect to admin
  if (user.isAdmin) {
    console.log("UserLayout: Admin user detected, redirecting to admin area");
    return <Navigate to="/admin" replace />;
  }

  console.log("UserLayout: Rendering user dashboard for", user.email);

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
