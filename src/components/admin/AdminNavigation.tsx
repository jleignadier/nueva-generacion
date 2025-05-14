
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Trophy, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: Home,
    exact: true
  },
  {
    name: 'Events',
    path: '/admin/events',
    icon: Calendar
  },
  {
    name: 'Donations',
    path: '/admin/donations',
    icon: Trophy
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: User
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings
  }
];

export const AdminNavigation: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="w-64 h-full bg-zinc-800 border-r border-zinc-700 flex flex-col">
      {/* Admin header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center">
          <div className="bg-purple-600 h-10 w-10 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">NG</span>
          </div>
          <div className="ml-3">
            <h2 className="text-white font-medium">Nueva Gen</h2>
            <p className="text-xs text-zinc-400">Admin Portal</p>
          </div>
        </div>
      </div>
      
      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `
                flex items-center px-4 py-3 text-sm rounded-md transition-colors
                ${isActive 
                  ? 'bg-zinc-700 text-purple-400' 
                  : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'}
              `}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Logout */}
      <div className="p-4 border-t border-zinc-700">
        <button 
          onClick={logout}
          className="flex items-center px-4 py-3 w-full text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
