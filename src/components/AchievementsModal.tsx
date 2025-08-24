import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Gift, Calendar, Crown, Star, Users, Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: number;
  type: 'donation' | 'events' | 'points';
  earned: boolean;
  progress: number;
  color: string;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  // Calculate user stats from localStorage
  const userStats = useMemo(() => {
    const donations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    const attendedEventIds = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
    
    const totalDonated = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
    const eventsAttended = attendedEventIds.length;
    const pointsEarned = eventsAttended * 40; // 40 points per event

    return {
      totalDonated,
      eventsAttended,
      pointsEarned
    };
  }, []);

  // Check if user won any competition
  const hasWonCompetition = useMemo(() => {
    // Check localStorage for competition wins
    const competitionWins = JSON.parse(localStorage.getItem('competitionWins') || '[]');
    return competitionWins.length > 0;
  }, []);

  // Define achievements
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'first-donation',
      title: 'Primera Donación',
      description: 'Realiza tu primera donación',
      icon: Gift,
      requirement: 1,
      type: 'donation',
      earned: userStats.totalDonated >= 1,
      progress: Math.min(userStats.totalDonated, 1),
      color: 'text-green-500'
    },
    {
      id: 'generous-donor',
      title: 'Donante Generoso',
      description: 'Dona $100 o más en total',
      icon: Crown,
      requirement: 100,
      type: 'donation',
      earned: userStats.totalDonated >= 100,
      progress: Math.min(userStats.totalDonated, 100),
      color: 'text-amber-500'
    },
    {
      id: 'community-champion',
      title: 'Campeón Comunitario',
      description: 'Dona $500 o más en total',
      icon: Award,
      requirement: 500,
      type: 'donation',
      earned: userStats.totalDonated >= 500,
      progress: Math.min(userStats.totalDonated, 500),
      color: 'text-purple-500'
    },
    {
      id: 'competition-winner',
      title: 'Ganador del Desafío',
      description: 'Gana una competencia de voluntariado',
      icon: Crown,
      requirement: 1,
      type: 'points',
      earned: hasWonCompetition,
      progress: hasWonCompetition ? 1 : 0,
      color: 'text-gold-500'
    },
    {
      id: 'event-volunteer',
      title: 'Voluntario de Eventos',
      description: 'Asiste a 5 eventos',
      icon: Calendar,
      requirement: 5,
      type: 'events',
      earned: userStats.eventsAttended >= 5,
      progress: Math.min(userStats.eventsAttended, 5),
      color: 'text-blue-500'
    },
    {
      id: 'dedication-badge',
      title: 'Insignia de Dedicación',
      description: 'Asiste a 10 eventos',
      icon: Users,
      requirement: 10,
      type: 'events',
      earned: userStats.eventsAttended >= 10,
      progress: Math.min(userStats.eventsAttended, 10),
      color: 'text-teal-500'
    },
    {
      id: 'rising-star',
      title: 'Estrella en Ascenso',
      description: 'Asiste a 15 eventos',
      icon: Star,
      requirement: 15,
      type: 'events',
      earned: userStats.eventsAttended >= 15,
      progress: Math.min(userStats.eventsAttended, 15),
      color: 'text-pink-500'
    }
  ], [userStats, hasWonCompetition]);

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award size={20} className="mr-2 text-primary" />
            Logros y Insignias
          </DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <Gift size={16} className="mx-auto mb-1 text-green-500" />
              <p className="text-xs text-muted-foreground">Donado</p>
              <p className="font-semibold">${userStats.totalDonated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar size={16} className="mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Eventos</p>
              <p className="font-semibold">{userStats.eventsAttended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Star size={16} className="mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-muted-foreground">Puntos</p>
              <p className="font-semibold">{userStats.pointsEarned}</p>
            </CardContent>
          </Card>
        </div>

        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <>
            <h3 className="font-semibold mb-3 flex items-center">
              <Award size={16} className="mr-2" />
              Logros Desbloqueados ({earnedAchievements.length})
            </h3>
            <div className="space-y-3 mb-6">
              {earnedAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full bg-white ${achievement.color}`}>
                        <achievement.icon size={20} />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge className="ml-2 bg-green-500 text-white">
                            ✓ Desbloqueado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <>
            <h3 className="font-semibold mb-3 flex items-center">
              <Lock size={16} className="mr-2" />
              Próximos Logros
            </h3>
            <div className="space-y-3">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-gray-200 text-gray-400">
                        <Lock size={20} />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="font-semibold text-gray-600">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(achievement.progress / achievement.requirement) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {achievement.progress}/{achievement.requirement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <Button onClick={onClose} className="w-full mt-6">
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsModal;