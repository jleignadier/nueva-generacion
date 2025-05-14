
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, LogOut, User, Award, Bell, Settings, Gift, ChevronRight, CircleDollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Donation statistics - this would typically come from your API
  const donationStats = {
    total: 350,
    count: 12,
    lastDonation: '2023-05-01',
    recentDonations: [
      { id: 1, amount: 50, date: '2023-05-01', cause: 'Beach Cleanup' },
      { id: 2, amount: 75, date: '2023-04-15', cause: 'Animal Shelter' },
      { id: 3, amount: 25, date: '2023-03-22', cause: 'Food Bank' },
    ]
  };

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

      {/* Donation Tracker Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-nuevagen-green bg-opacity-10 flex items-center justify-center text-nuevagen-green mr-3">
                <Gift size={20} />
              </div>
              <h3 className="text-lg font-semibold">Your Donations</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-nuevagen-blue">
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Donated</p>
              <div className="flex items-center mt-1">
                <CircleDollarSign size={18} className="text-nuevagen-green mr-1" />
                <span className="text-xl font-semibold">${donationStats.total}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Donations Made</p>
              <div className="flex items-center mt-1">
                <Gift size={18} className="text-nuevagen-blue mr-1" />
                <span className="text-xl font-semibold">{donationStats.count}</span>
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Donations</h4>
          <div className="space-y-3">
            {donationStats.recentDonations.map(donation => (
              <div key={donation.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{donation.cause}</p>
                  <p className="text-sm text-gray-500">{donation.date}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-nuevagen-green">${donation.amount}</span>
                  <ChevronRight size={16} className="text-gray-400 ml-2" />
                </div>
              </div>
            ))}
          </div>
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
