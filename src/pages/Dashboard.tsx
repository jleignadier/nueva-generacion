
import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-auto pb-16">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
};

export default Dashboard;
