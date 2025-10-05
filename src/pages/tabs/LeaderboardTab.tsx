import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, User, Users, Calendar, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompetitionsStore } from '@/store/competitionsStore';
import UserProfileModal from '@/components/UserProfileModal';
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id?: string;
  organization_id?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  rank: number;
  value: number;
  avatar: string;
  hours?: number;
  events?: number;
  organizationName?: string;
  profilePicture?: string;
  avatar_url?: string;
  logo_url?: string;
}

const LeaderboardTab = () => {
  const { user } = useAuth();
  const { getActiveCompetition } = useCompetitionsStore();
  const [currentTab, setCurrentTab] = useState('individual');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userLeaders, setUserLeaders] = useState<LeaderboardEntry[]>([]);
  const [orgLeaders, setOrgLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activeCompetition = getActiveCompetition();

  // Fetch user leaderboard
  useEffect(() => {
    fetchUserLeaderboard();
    fetchOrgLeaderboard();

    // Subscribe to real-time updates
    const userPointsChannel = supabase
      .channel('user-points-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_points'
      }, () => {
        fetchUserLeaderboard();
      })
      .subscribe();

    const orgPointsChannel = supabase
      .channel('org-points-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'organization_points'
      }, () => {
        fetchOrgLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userPointsChannel);
      supabase.removeChannel(orgPointsChannel);
    };
  }, []);

  const fetchUserLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_leaderboard', { p_limit: 50 });
      
      if (error) throw error;

      const formatted: LeaderboardEntry[] = (data || []).map((item: any) => ({
        user_id: item.user_id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Usuario',
        rank: Number(item.rank),
        value: item.points || 0,
        avatar: item.first_name?.charAt(0) || '?',
        hours: Number(item.total_hours) || 0,
        events: item.events_attended || 0,
        organizationName: item.organization_name,
        avatar_url: item.avatar_url,
      }));

      setUserLeaders(formatted);
    } catch (error) {
      console.error('Error fetching user leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgLeaderboard = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not authenticated - organization leaderboard requires auth
        setOrgLeaders([]);
        return;
      }
      
      const { data, error } = await supabase.rpc('get_organization_leaderboard', { p_limit: 50 });
      
      if (error) throw error;

      const formatted: LeaderboardEntry[] = (data || []).map((item: any) => ({
        organization_id: item.organization_id,
        name: item.name || 'Organización',
        rank: Number(item.rank),
        value: item.points || 0,
        avatar: item.name?.charAt(0) || 'O',
        logo_url: item.logo_url,
      }));

      setOrgLeaders(formatted);
    } catch (error) {
      console.error('Error fetching org leaderboard:', error);
      setOrgLeaders([]);
    }
  };

  const renderUserStats = () => {
    const isIndividualTab = currentTab === 'individual';
    const currentUserData = userLeaders.find(u => u.user_id === user?.id);
    const rank = currentUserData?.rank || '-';
    const value = currentUserData?.value || 0;
    
    return (
      <Card className="mb-4 bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg mr-3">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-bold">{user?.name || 'Usuario'}</h3>
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

  const isProfileClickable = (entry: LeaderboardEntry) => {
    if (entry.user_id === user?.id) return false;
    return true;
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
    if (!isProfileClickable(entry)) return;
    setSelectedUser(entry);
    setShowUserProfile(true);
  };

  const renderLeaderboard = (entries: LeaderboardEntry[], isOrgLeaderboard = false) => {
    if (loading) {
      return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
    }

    if (entries.length === 0) {
      if (isOrgLeaderboard && !user) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Debes iniciar sesión para ver el ranking de organizaciones</p>
            <p className="text-sm">Esta información solo está disponible para usuarios autenticados</p>
          </div>
        );
      }
      return <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>;
    }

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isUser = entry.user_id === user?.id;
          const isTop3 = entry.rank <= 3;
          const isClickable = isProfileClickable(entry);
          
          return (
            <Card 
              key={entry.user_id || entry.organization_id || index} 
              className={`${isUser ? 'border-primary bg-primary/5' : ''} ${
                isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
              }`}
              onClick={() => isClickable && handleUserClick(entry)}
            >
              <CardContent className="p-3 flex items-center">
                <div className="w-8 flex justify-center font-semibold text-muted-foreground">
                  {entry.rank}
                </div>
                
                <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                  {entry.avatar_url || entry.logo_url ? (
                    <img 
                      src={entry.avatar_url || entry.logo_url} 
                      alt={`${entry.name} profile`} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-medium text-white text-sm">
                      {entry.avatar}
                    </span>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${isUser ? 'text-primary' : ''} flex items-center`}>
                    {entry.name}
                    {isClickable && (
                      <Eye size={14} className="ml-2 text-muted-foreground" />
                    )}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {entry.value} puntos
                    {entry.hours !== undefined && ` • ${entry.hours} horas`}
                  </div>
                </div>
                
                {isTop3 && (
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full
                    ${entry.rank === 1 
                      ? 'bg-yellow-500' 
                      : entry.rank === 2 
                        ? 'bg-gray-400' 
                        : 'bg-amber-700'
                    }`}
                  >
                    <Trophy size={16} className="text-white" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

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
              {renderLeaderboard(userLeaders, false)}
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
              {renderLeaderboard(orgLeaders, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          userHours={selectedUser.hours}
          userEvents={selectedUser.events}
        />
      )}
    </div>
  );
};

export default LeaderboardTab;
