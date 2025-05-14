
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400">Total Events</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div>
              <p className="text-zinc-400">Total Donations</p>
              <p className="text-2xl font-bold">$24,500</p>
            </div>
            <div>
              <p className="text-zinc-400">Active Users</p>
              <p className="text-2xl font-bold">347</p>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b border-zinc-700 pb-3">
              <p className="font-medium">New Donation: $500</p>
              <p className="text-sm text-zinc-400">From: John Doe • 2 hours ago</p>
            </div>
            <div className="border-b border-zinc-700 pb-3">
              <p className="font-medium">New User Registered</p>
              <p className="text-sm text-zinc-400">Maria Garcia • 5 hours ago</p>
            </div>
            <div>
              <p className="font-medium">Event Created: Fundraising Gala</p>
              <p className="text-sm text-zinc-400">By: Admin • 1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
