
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, User, Settings } from 'lucide-react';

const tabs = [
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

export const AdminTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-zinc-800 border-t border-zinc-700 shadow-sm fixed bottom-0 left-0 right-0">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? location.pathname === tab.path 
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-zinc-400 hover:text-purple-300'
                }`
              }
              end={tab.exact}
            >
              <tab.icon size={20} />
              <span className="text-xs mt-1">{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
