
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  
  // While loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  // If not admin, redirect to dashboard
  if (!user?.isAdmin) {
    console.log("AdminLayout: Access denied - User is not admin");
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
