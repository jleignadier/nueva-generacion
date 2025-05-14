
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Debug user state
  console.log("AdminRoute - User state:", { user, isAdmin: user?.isAdmin, isLoading });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Single protection check - if not admin, redirect to dashboard
  if (!user?.isAdmin) {
    console.log("AdminRoute - Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // User is admin, render children
  console.log("AdminRoute - Admin confirmed, rendering children");
  return <>{children}</>;
};

export default AdminRoute;
