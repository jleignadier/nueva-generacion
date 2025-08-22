
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Gift, Trophy, User } from 'lucide-react';

const tabs = [
  {
    name: 'Home',
    path: '/dashboard',
    icon: Home,
    exact: true
  },
  {
    name: 'Donaciones',
    path: '/dashboard/donations',
    icon: Gift
  },
  {
    name: 'Leaderboard',
    path: '/dashboard/leaderboard',
    icon: Trophy
  },
  {
    name: 'Perfil',
    path: '/dashboard/profile',
    icon: User
  }
];

export const TabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white border-t border-gray-200 shadow-sm">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? location.pathname === tab.path 
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-nuevagen-blue'
                  : 'text-gray-500 hover:text-nuevagen-teal'
              }`}
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
