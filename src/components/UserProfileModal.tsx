import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Gift, Star, User, Shield } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  userPoints: number;
  userRank: number;
}

interface MockUserProfile {
  name: string;
  avatar: string;
  points: number;
  rank: number;
  joinDate: string;
  eventsAttended: number;
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
  userRank 
}) => {
  // Check if this user profile should be visible
  const isProfileVisible = useMemo(() => {
    // For now, we'll make all leaderboard users visible
    // In a real app, this would check each user's privacy settings
    return true;
  }, []);

  // Generate mock profile data based on user info
  const userProfile: MockUserProfile = useMemo(() => {
    const joinMonthsAgo = Math.floor(Math.random() * 12) + 1;
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - joinMonthsAgo);
    
    const eventsAttended = Math.floor(userPoints / 4); // Rough estimate
    const totalDonated = Math.floor(userPoints * 2.5); // Rough estimate
    
    // Generate achievements based on activity
    const achievements = [];
    if (totalDonated >= 1) achievements.push('Primera Donación');
    if (totalDonated >= 100) achievements.push('Donante Generoso');
    if (eventsAttended >= 5) achievements.push('Voluntario de Eventos');
    if (userRank <= 10) achievements.push('Top 10');
    if (userRank <= 3) achievements.push('Podio');

    return {
      name: userName,
      avatar: userAvatar,
      points: userPoints,
      rank: userRank,
      joinDate: joinDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
      eventsAttended,
      totalDonated,
      achievements,
      isVerified: userRank <= 20 // Top 20 users are "verified"
    };
  }, [userName, userAvatar, userPoints, userRank]);

  if (!isProfileVisible) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield size={20} className="mr-2 text-muted-foreground" />
              Perfil Privado
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Shield size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Este usuario ha configurado su perfil como privado.
            </p>
          </div>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

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
        <div className="mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar size={20} className="mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Eventos</p>
              <p className="text-lg font-semibold">{userProfile.eventsAttended}</p>
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
              <p>• Completó {userProfile.eventsAttended} eventos este año</p>
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