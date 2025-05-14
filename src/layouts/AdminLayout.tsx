
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("AdminLayout mounted, user:", user?.email, "isAdmin:", user?.isAdmin);
  }, [user]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  // If no user or not admin, redirect to login
  if (!user) {
    console.log("AdminLayout: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isAdmin) {
    console.log("AdminLayout: Non-admin user detected, redirecting to user dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Admin sidebar navigation */}
      <AdminNavigation />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
