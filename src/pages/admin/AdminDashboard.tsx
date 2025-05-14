
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminTabBar } from '@/components/AdminTabBar';

const AdminDashboard = () => {
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
