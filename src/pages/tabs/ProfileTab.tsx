
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, LogOut, User, Award, Bell, Settings, Gift, ChevronRight, CircleDollarSign, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Donation statistics - this would typically come from your API
  const donationStats = {
    total: 350,
    count: 12,
    points: 45, // Points earned from donations
    lastDonation: '2023-05-01',
    recentDonations: [
      { id: 1, amount: 50, date: '2023-05-01', cause: 'Beach Cleanup', points: 8 },
      { id: 2, amount: 75, date: '2023-04-15', cause: 'Animal Shelter', points: 12 },
      { id: 3, amount: 25, date: '2023-03-22', cause: 'Food Bank', points: 5 },
    ]
  };

  // Events statistics - this would typically come from your API
  const eventStats = {
    total: 15,
    points: 142, // Points earned from events
    hoursVolunteered: 48,
    lastEvent: '2023-05-15',
    recentEvents: [
      { id: 1, title: 'Community Garden Cleanup', date: '2023-05-15', points: 15, hours: 4 },
      { id: 2, title: 'Food Drive Organization', date: '2023-05-08', points: 20, hours: 6 },
      { id: 3, title: 'Senior Center Visit', date: '2023-04-28', points: 10, hours: 3 },
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
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Total<br />Donated</p>
              <div className="flex items-center mt-1">
                <CircleDollarSign size={16} className="text-nuevagen-green mr-1" />
                <span className="text-lg font-semibold">${donationStats.total}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Donations<br />Made</p>
              <div className="flex items-center mt-1">
                <Gift size={16} className="text-nuevagen-blue mr-1" />
                <span className="text-lg font-semibold">{donationStats.count}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Points<br />Earned</p>
              <div className="flex items-center mt-1">
                <Trophy size={16} className="text-nuevagen-yellow mr-1" />
                <span className="text-lg font-semibold">{donationStats.points}</span>
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Donations</h4>
          <div className="space-y-3">
            {donationStats.recentDonations.map(donation => (
              <div key={donation.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{donation.cause}</p>
                  <p className="text-xs text-gray-500">{donation.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center">
                      <span className="font-semibold text-nuevagen-green text-sm">${donation.amount}</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy size={12} className="text-nuevagen-yellow mr-1" />
                      <span className="text-xs text-gray-600">{donation.points} pts</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Attended Tracker Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-nuevagen-purple bg-opacity-10 flex items-center justify-center text-nuevagen-purple mr-3">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-semibold">Events Attended</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-nuevagen-blue">
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Events<br />Attended</p>
              <div className="flex items-center mt-1">
                <Calendar size={16} className="text-nuevagen-purple mr-1" />
                <span className="text-lg font-semibold">{eventStats.total}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Hours<br />Volunteered</p>
              <div className="flex items-center mt-1">
                <Award size={16} className="text-nuevagen-teal mr-1" />
                <span className="text-lg font-semibold">{eventStats.hoursVolunteered}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Points<br />Earned</p>
              <div className="flex items-center mt-1">
                <Trophy size={16} className="text-nuevagen-yellow mr-1" />
                <span className="text-lg font-semibold">{eventStats.points}</span>
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Events</h4>
          <div className="space-y-3">
            {eventStats.recentEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center">
                      <span className="font-semibold text-nuevagen-purple text-sm">{event.hours}h</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy size={12} className="text-nuevagen-yellow mr-1" />
                      <span className="text-xs text-gray-600">{event.points} pts</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
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
