
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { toast } from '@/hooks/use-toast';

const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Add detailed console logs for debugging
  useEffect(() => {
    console.log('AdminLayout rendered', { 
      user: user?.email, 
      isAdmin: user?.isAdmin, 
      isLoading, 
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading, location.pathname]);
  
  // While loading, show loading state
  if (isLoading) {
    console.log("AdminLayout: Loading state");
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  // If not admin, redirect to dashboard with toast notification
  if (!user || !user.isAdmin) {
    console.log("AdminLayout: Access denied - User is not admin", { user: user?.email });
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin area",
      variant: "destructive"
    });
    return <Navigate to="/dashboard" replace />;
  }

  console.log("AdminLayout: Rendering admin interface for", user.email);
  
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
