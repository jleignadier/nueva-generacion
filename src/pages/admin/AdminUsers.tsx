
import React from 'react';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">All Users</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users..."
              className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active' },
                { name: 'Maria Garcia', email: 'maria@example.com', role: 'User', status: 'Active' },
                { name: 'Admin User', email: 'admin@ng.org.pa', role: 'Admin', status: 'Active' },
              ].map((user, i) => (
                <tr key={i} className="border-b border-zinc-700">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'Admin' 
                        ? 'bg-purple-900/30 text-purple-400'
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-400 text-sm">
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
