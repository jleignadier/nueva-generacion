
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, LogOut, User, Award, Settings, Gift, ChevronRight, CircleDollarSign, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditProfileForm from '@/components/EditProfileForm';
import DonationHistoryModal from '@/components/DonationHistoryModal';
import EventHistoryModal from '@/components/EventHistoryModal';
import AchievementsModal from '@/components/AchievementsModal';
import UserSettingsModal from '@/components/UserSettingsModal';
import { useEventsStore } from '@/store/eventsStore';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDonationHistory, setShowDonationHistory] = useState(false);
  const [showEventHistory, setShowEventHistory] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get actual donation stats from localStorage (same as DonationHistoryModal)
  const getDonationStats = () => {
    const donations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    const total = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTotal = donations
      .filter((d: any) => {
        const donationDate = new Date(d.date);
        return donationDate.getMonth() === thisMonth && donationDate.getFullYear() === thisYear;
      })
      .reduce((sum: number, d: any) => sum + Number(d.amount), 0);

    return { total, thisMonth: monthlyTotal };
  };

  const donationStats = getDonationStats();

  // Get actual attended events from localStorage
  const getAttendedEventsStats = () => {
    const attendedEventIds = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
    
    // Calculate points based on actual events attended
    const { events } = useEventsStore.getState();
    const points = attendedEventIds.reduce((total: number, eventId: string) => {
      const event = events.find(e => e.id === eventId);
      return total + (event?.pointsEarned || 0);
    }, 0);
    
    return {
      attended: attendedEventIds.length,
      hours: attendedEventIds.length * 3, // Rough estimate
      points: points
    };
  };

  const eventStats = getAttendedEventsStats();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Award,
      title: 'Logros',
      description: 'Ve tus insignias y recompensas de voluntario',
      onClick: () => setShowAchievements(true)
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Ajustar configuración de la aplicación',
      onClick: () => setShowSettings(true)
    }
  ];

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>
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
            onClick={() => setShowEditProfile(true)}
          >
            <Edit size={16} className="mr-2" />
            Editar Perfil
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
                  <h3 className="text-base font-semibold">Tus Donaciones</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80"
                  onClick={() => setShowDonationHistory(true)}
                >
                  Ver Todas
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Total<br />Donado</p>
                  <div className="flex items-center mt-1">
                    <CircleDollarSign size={16} className="text-nuevagen-green mr-1" />
                    <span className="text-lg font-semibold">${donationStats.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Este<br />Mes</p>
                  <div className="flex items-center mt-1">
                    <Gift size={16} className="text-nuevagen-green mr-1" />
                    <span className="text-lg font-semibold">${donationStats.thisMonth.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-3">Donaciones Recientes</h4>
              <div className="space-y-3">
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">El historial de donaciones aparecerá aquí</p>
                </div>
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
              <h3 className="text-base font-semibold">Eventos Asistidos</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
              onClick={() => setShowEventHistory(true)}
            >
              Ver Todos
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Eventos<br />Asistidos</p>
              <div className="flex items-center mt-1">
                <Calendar size={16} className="text-nuevagen-purple mr-1" />
                <span className="text-lg font-semibold">{eventStats.attended}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Horas de<br />Voluntariado</p>
              <div className="flex items-center mt-1">
                <Award size={16} className="text-nuevagen-teal mr-1" />
                <span className="text-lg font-semibold">{eventStats.hours}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Puntos<br />Ganados</p>
              <div className="flex items-center mt-1">
                <Trophy size={16} className="text-nuevagen-yellow mr-1" />
                <span className="text-lg font-semibold">{eventStats.points}</span>
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-3">Eventos Recientes</h4>
          <div className="space-y-3">
            {eventStats.attended > 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">El historial de eventos aparecerá aquí</p>
                <p className="text-xs">Escanea códigos QR en eventos para rastrear tu participación</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Aún no has asistido a eventos</p>
                <p className="text-xs">Escanea códigos QR en eventos para ganar horas de voluntariado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={item.onClick}
          >
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <item.icon size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
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
        Cerrar Sesión
      </Button>

      {/* Modals */}
      <EditProfileForm 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
      <DonationHistoryModal 
        isOpen={showDonationHistory} 
        onClose={() => setShowDonationHistory(false)} 
      />
      <EventHistoryModal 
        isOpen={showEventHistory} 
        onClose={() => setShowEventHistory(false)} 
      />
      <AchievementsModal 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)} 
      />
      <UserSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default ProfileTab;
