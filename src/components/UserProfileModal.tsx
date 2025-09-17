import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Star, User } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  userPoints: number;
  userRank: number;
  userHours?: number;
  userEvents?: number;
}

interface MockUserProfile {
  name: string;
  avatar: string;
  points: number;
  rank: number;
  joinDate: string;
  eventsAttended: number;
  hoursVolunteered: number;
  totalDonated: number;
  achievements: string[];
  isVerified: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userName, 
  userAvatar, 
  userPoints, 
  userRank,
  userHours = 0,
  userEvents = 0
}) => {
  // Generate mock profile data based on user info
  const userProfile: MockUserProfile = useMemo(() => {
    const joinMonthsAgo = Math.floor(Math.random() * 12) + 1;
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - joinMonthsAgo);
    
    const eventsAttended = userEvents || Math.floor(userPoints / 4); // Use provided or estimate
    const hoursVolunteered = userHours || eventsAttended * 3; // Use provided or estimate
    const totalDonated = Math.floor(userPoints * 2.5); // Rough estimate
    
    // Generate achievements based on activity
    const achievements = [];
    if (totalDonated >= 1) achievements.push('Primera Donación');
    if (totalDonated >= 100) achievements.push('Donante Generoso');
    if (eventsAttended >= 5) achievements.push('Voluntario de Eventos');
    if (hoursVolunteered >= 20) achievements.push('Voluntario Dedicado');
    if (userRank <= 10) achievements.push('Top 10');
    if (userRank <= 3) achievements.push('Podio');

    return {
      name: userName,
      avatar: userAvatar,
      points: userPoints,
      rank: userRank,
      joinDate: joinDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
      eventsAttended,
      hoursVolunteered,
      totalDonated,
      achievements,
      isVerified: userRank <= 20 // Top 20 users are "verified"
    };
  }, [userName, userAvatar, userPoints, userRank, userHours, userEvents]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User size={20} className="mr-2 text-primary" />
            Perfil de Usuario
          </DialogTitle>
        </DialogHeader>

        {/* User Header */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {userProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-xl font-semibold">{userProfile.name}</h2>
                  {userProfile.isVerified && (
                    <Badge className="bg-blue-500 text-white text-xs whitespace-nowrap shrink-0">
                      ✓ Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Miembro desde {userProfile.joinDate}
                </p>
                <div className="flex items-center mt-2">
                  <Trophy size={16} className="mr-1 text-amber-500" />
                  <span className="text-sm font-medium">
                    Rank #{userProfile.rank} • {userProfile.points} puntos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Eventos</p>
              <p className="text-lg font-semibold">{userProfile.eventsAttended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-sm text-muted-foreground">Horas</p>
              <p className="text-lg font-semibold">{userProfile.hoursVolunteered}</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {userProfile.achievements.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Star size={16} className="mr-2 text-amber-500" />
                Logros ({userProfile.achievements.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.achievements.map((achievement, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Trophy size={16} className="mr-2 text-primary" />
              Actividad Reciente
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Asistió a un evento de limpieza comunitaria</p>
              <p>• Alcanzó {userProfile.points} puntos de voluntariado</p>
              <p>• Completó {userProfile.eventsAttended} eventos y {userProfile.hoursVolunteered} horas</p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={onClose} className="w-full">
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;