
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, LogOut, User, Award, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: User,
      title: 'Account Information',
      description: 'Update your personal details'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'View your volunteer badges and rewards'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notification preferences'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Adjust app settings'
    }
  ];

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-nuevagen-blue text-white text-xl">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs bg-nuevagen-green bg-opacity-20 text-nuevagen-green px-2 py-0.5 rounded-full">
                  {user?.accountType}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 flex items-center justify-center"
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card key={index} className="overflow-hidden hover:bg-gray-50">
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-nuevagen-blue bg-opacity-10 flex items-center justify-center text-nuevagen-blue">
                <item.icon size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Edit size={16} className="text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />
      
      <Button 
        variant="outline" 
        className="w-full border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut size={16} className="mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default ProfileTab;
