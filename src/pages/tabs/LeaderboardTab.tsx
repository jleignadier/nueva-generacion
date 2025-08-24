import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, User, Users, Calendar, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompetitionsStore } from '@/store/competitionsStore';
import UserProfileModal from '@/components/UserProfileModal';

interface LeaderboardEntry {
  id: number;
  name: string;
  rank: number;
  value: number;
  avatar: string;
}

const LeaderboardTab = () => {
  const { user } = useAuth();
  const { getActiveCompetition } = useCompetitionsStore();
  const [currentTab, setCurrentTab] = useState('individual');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const activeCompetition = getActiveCompetition();

  // User data
  const userPoints = 28;
  const userRank = 12;
  const organizationPoints = 35;
  const organizationRank = 18;

  const volunteerLeaders: LeaderboardEntry[] = [
    { id: 1, name: 'Maria Garcia', rank: 1, value: 78, avatar: 'MG' },
    { id: 2, name: 'James Wilson', rank: 2, value: 64, avatar: 'JW' },
    { id: 3, name: 'Sarah Johnson', rank: 3, value: 59, avatar: 'SJ' },
    { id: 4, name: 'David Lee', rank: 4, value: 52, avatar: 'DL' },
    { id: 5, name: 'Li Wei', rank: 5, value: 47, avatar: 'LW' },
    { id: 6, name: 'Olivia Martinez', rank: 6, value: 42, avatar: 'OM' },
    { id: 7, name: 'John Smith', rank: 7, value: 38, avatar: 'JS' },
    { id: 8, name: user?.name || 'User Name', rank: userRank, value: userPoints, avatar: user?.name?.charAt(0) || '?' },
  ];

  const organizationLeaders: LeaderboardEntry[] = [
    { id: 1, name: 'Green Earth Foundation', rank: 1, value: 250, avatar: 'GE' },
    { id: 2, name: 'Community Helpers', rank: 2, value: 175, avatar: 'CH' },
    { id: 3, name: 'Tech Solutions Inc.', rank: 3, value: 150, avatar: 'TS' },
    { id: 4, name: 'Global Outreach', rank: 4, value: 120, avatar: 'GO' },
    { id: 5, name: 'Global Helpers', rank: 5, value: 115, avatar: 'GH' },
    { id: 6, name: 'Future Leaders', rank: 6, value: 95, avatar: 'FL' },
    { id: 7, name: 'Community First', rank: 7, value: 90, avatar: 'CF' },
    { id: 8, name: user?.name || 'User Organization', rank: organizationRank, value: organizationPoints, avatar: user?.name?.charAt(0) || '?' },
  ];

  const renderUserStats = () => {
    const isIndividualTab = currentTab === 'individual';
    const rank = isIndividualTab ? userRank : organizationRank;
    const value = isIndividualTab ? userPoints : organizationPoints;
    
    return (
      <Card className="mb-4 bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg mr-3">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold">{user?.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end text-white/80 text-sm">
                <Trophy size={14} className="mr-1" />
                Puesto #{rank}
              </div>
              <div className="text-2xl font-bold mt-1">
                {value} puntos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActiveCompetition = () => {
    if (!activeCompetition) return null;

    const endDate = new Date(activeCompetition.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Card className="mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg mr-3">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{activeCompetition.name}</h3>
                <p className="text-sm opacity-90">Competencia Actual</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end text-white/80 text-sm">
                <Calendar size={14} className="mr-1" />
                {daysLeft > 0 ? `${daysLeft} días restantes` : '¡Termina hoy!'}
              </div>
              <div className="text-lg font-bold mt-1">
                🏆 {activeCompetition.prize}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to check if profile is clickable
  const isProfileClickable = (entry: LeaderboardEntry) => {
    // Don't make current user's profile clickable
    if (entry.name === user?.name) return false;
    
    // For demo purposes, make all leaderboard users clickable
    // In real app, would check individual user privacy settings
    return true;
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
    if (!isProfileClickable(entry)) return;
    
    setSelectedUser(entry);
    setShowUserProfile(true);
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isUser = entry.name === user?.name;
        const isTop3 = entry.rank <= 3;
        const isClickable = isProfileClickable(entry);
        
        return (
          <Card 
            key={entry.id} 
            className={`${isUser ? 'border-primary bg-primary/5' : ''} ${
              isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
            }`}
            onClick={() => isClickable && handleUserClick(entry)}
          >
            <CardContent className="p-3 flex items-center">
              <div className="w-8 flex justify-center font-semibold text-muted-foreground">
                {entry.rank}
              </div>
              
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium text-white 
                ${isTop3 
                  ? entry.rank === 1 
                    ? 'bg-yellow-500' 
                    : entry.rank === 2 
                      ? 'bg-gray-400' 
                      : 'bg-amber-700'
                  : 'bg-primary'
                }`}
              >
                {isTop3 && <Trophy size={16} />}
                {!isTop3 && entry.avatar}
              </div>
              
              <div className="ml-3 flex-1">
                <p className={`font-medium ${isUser ? 'text-primary' : ''} flex items-center`}>
                  {entry.name}
                  {isClickable && (
                    <Eye size={14} className="ml-2 text-muted-foreground" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUser ? `${entry.value} puntos` : 'Puntos privados'}
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

      {renderActiveCompetition()}
      {renderUserStats()}

      <Tabs
        defaultValue="individual" 
        onValueChange={setCurrentTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="individual" className="flex items-center">
            <User size={20} className="mr-2" />
            Voluntarios
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center">
            <Users size={20} className="mr-2" />
            Organizaciones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy size={20} className="mr-2 text-nuevagen-yellow" />
                Mejores Voluntarios Individuales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {renderLeaderboard(volunteerLeaders)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="organization">
          <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy size={20} className="mr-2 text-nuevagen-yellow" />
                Mejores Organizaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {renderLeaderboard(organizationLeaders)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUser(null);
          }}
          userName={selectedUser.name}
          userAvatar={selectedUser.avatar}
          userPoints={selectedUser.value}
          userRank={selectedUser.rank}
        />
      )}
    </div>
  );
};

export default LeaderboardTab;
