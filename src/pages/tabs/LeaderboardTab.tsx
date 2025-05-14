
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: number;
  name: string;
  rank: number;
  value: number;
  avatar: string;
}

const LeaderboardTab = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('hours');

  const volunteerHoursLeaders: LeaderboardEntry[] = [
    { id: 1, name: 'Maria Garcia', rank: 1, value: 78, avatar: 'MG' },
    { id: 2, name: 'James Wilson', rank: 2, value: 64, avatar: 'JW' },
    { id: 3, name: 'Sarah Johnson', rank: 3, value: 59, avatar: 'SJ' },
    { id: 4, name: 'David Lee', rank: 4, value: 52, avatar: 'DL' },
    { id: 5, name: 'Li Wei', rank: 5, value: 47, avatar: 'LW' },
    { id: 6, name: 'Olivia Martinez', rank: 6, value: 42, avatar: 'OM' },
    { id: 7, name: 'John Smith', rank: 7, value: 38, avatar: 'JS' },
    { id: 8, name: 'User Name', rank: 12, value: 28, avatar: user?.name.charAt(0) || '?' },
  ];

  const donationsLeaders: LeaderboardEntry[] = [
    { id: 1, name: 'Christina Wong', rank: 1, value: 2500, avatar: 'CW' },
    { id: 2, name: 'Robert Johnson', rank: 2, value: 1750, avatar: 'RJ' },
    { id: 3, name: 'Tech Solutions Inc.', rank: 3, value: 1500, avatar: 'TS' },
    { id: 4, name: 'Miguel Sanchez', rank: 4, value: 1200, avatar: 'MS' },
    { id: 5, name: 'Global Helpers', rank: 5, value: 1150, avatar: 'GH' },
    { id: 6, name: 'Aisha Patel', rank: 6, value: 950, avatar: 'AP' },
    { id: 7, name: 'Community First', rank: 7, value: 900, avatar: 'CF' },
    { id: 8, name: 'User Name', rank: 18, value: 350, avatar: user?.name.charAt(0) || '?' },
  ];

  const renderLeaderboard = (entries: LeaderboardEntry[], valueLabel: string) => (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isUser = entry.name === 'User Name';
        const isTop3 = entry.rank <= 3;
        
        return (
          <Card 
            key={entry.id} 
            className={`${isUser ? 'border-nuevagen-blue bg-blue-50' : ''}`}
          >
            <CardContent className="p-3 flex items-center">
              <div className="w-8 flex justify-center font-semibold text-gray-600">
                {entry.rank}
              </div>
              
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium text-white 
                ${isTop3 
                  ? entry.rank === 1 
                    ? 'bg-yellow-500' 
                    : entry.rank === 2 
                      ? 'bg-gray-400' 
                      : 'bg-amber-700'
                  : 'bg-nuevagen-purple'
                }`}
              >
                {isTop3 && <Trophy size={16} />}
                {!isTop3 && entry.avatar}
              </div>
              
              <div className="ml-3 flex-1">
                <p className={`font-medium ${isUser ? 'text-nuevagen-blue' : ''}`}>
                  {entry.name}
                </p>
                <p className="text-sm text-gray-600">
                  {valueLabel === 'hours' ? `${entry.value} hours` : `$${entry.value}`}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
        <Award size={24} className="text-nuevagen-yellow" />
      </div>

      <Tabs 
        defaultValue="hours" 
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="hours" className="flex items-center">
            <Clock size={16} className="mr-2" />
            Volunteer Hours
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center">
            <Trophy size={16} className="mr-2" />
            Donations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hours">
          <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy size={20} className="mr-2 text-nuevagen-yellow" />
                Top Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {renderLeaderboard(volunteerHoursLeaders, 'hours')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donations">
          <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy size={20} className="mr-2 text-nuevagen-yellow" />
                Top Donors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {renderLeaderboard(donationsLeaders, 'amount')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardTab;
