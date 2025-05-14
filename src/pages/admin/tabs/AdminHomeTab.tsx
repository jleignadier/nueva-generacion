
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const AdminHomeTab = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
          Admin
        </div>
      </div>

      <Card className="mb-4 bg-zinc-800 border-purple-500 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg mr-3">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold">{user?.name}</h3>
                <p className="text-sm text-zinc-400">Administrator</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">12</div>
            <div className="text-xs text-zinc-400">Active Events</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">48</div>
            <div className="text-xs text-zinc-400">Registered Users</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Donations</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">7</div>
            <div className="text-xs text-zinc-400">Pending Approval</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Points</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">320</div>
            <div className="text-xs text-zinc-400">Points Given</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHomeTab;
