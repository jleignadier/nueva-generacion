
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Trophy, User, Settings, LogOut, Menu, X, Building2 } from 'lucide-react';
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
    name: 'Organizations',
    path: '/admin/organizations',
    icon: Building2
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings
  }
];

export const AdminNavigation: React.FC = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-600 h-8 w-8 rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">NG</span>
          </div>
          <div className="ml-3">
            <h2 className="text-white font-medium">Nueva Gen Admin</h2>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-zinc-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-zinc-800 border-b border-zinc-700">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 text-sm rounded-md transition-colors
                  ${isActive 
                    ? 'bg-zinc-700 text-purple-400' 
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'}
                `}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button 
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center px-3 py-2 w-full text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-screen bg-zinc-800 border-r border-zinc-700 flex-col fixed left-0 top-0">
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
    </>
  );
};
