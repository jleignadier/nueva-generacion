import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Users, Share2, Award, Calendar, CheckCircle, DollarSign, Target, QrCode, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEventsStore } from '@/store/eventsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EventParticipants from '@/components/EventParticipants';
import EventDonationModal from '@/components/EventDonationModal';
import QRScanner from '@/components/QRScanner';
import { getEventRegistrationStatus, registerForEvent, downloadCalendarFile, markEventAttended } from '@/utils/eventUtils';
import { formatDate, formatEventTime } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    canRegister: false,
    isEventPast: false,
    canScanQR: false,
    hasAttended: false
  });
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [manualCheckInOpen, setManualCheckInOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { getEvent, registerForEvent: registerInDb, isUserRegistered } = useEventsStore();
  
  const event = id ? getEvent(id) : undefined;
  
  useEffect(() => {
    if (id && event && user) {
      checkRegistrationStatus();
      checkAttendance();
    }
  }, [id, event, user]);

  const checkRegistrationStatus = async () => {
    if (!id || !event || !user) return;

    // Check if user is registered in database
    const isRegistered = await isUserRegistered(id, user.id);
    
    // Calculate event status
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const isPast = eventDateTime < now;
    const canScanQR = !isPast && isRegistered;
    const canRegister = !isPast && !isRegistered;

    setRegistrationStatus({
      isRegistered,
      canRegister,
      isEventPast: isPast,
      canScanQR,
      hasAttended: false
    });
  };

  const checkAttendance = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('event_attendance')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setRegistrationStatus(prev => ({ ...prev, hasAttended: true, canScanQR: false }));
    }
  };

  const handleRegisterForReminder = async () => {
    if (!event || !id || !user) return;
    
    try {
      // Register in database
      await registerInDb(id, user.id, user.organizationId);
      
      // Download calendar file
      downloadCalendarFile({
        title: event.title,
        date: event.date,
        time: event.time,
        endTime: event.endTime,
        location: event.location,
        description: event.description
      });
      
      setRegistrationStatus(prev => ({ ...prev, isRegistered: true, canRegister: false, canScanQR: true }));
      
      toast({
        title: "¡Registrado exitosamente!",
        description: `Te has registrado para ${event.title}. Evento de calendario descargado.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrarse para el evento",
        variant: "destructive",
      });
    }
  };

  const handleQRScanSuccess = async (result: string) => {
    if (!event || !id || !user) return;
    
    try {
      const { error } = await supabase.rpc('award_event_points', {
        p_user_id: user.id,
        p_event_id: id,
        p_check_in_method: 'qr_scan'
      });

      if (error) throw error;

      markEventAttended(id);
      
      setRegistrationStatus(prev => ({ 
        ...prev, 
        hasAttended: true, 
        canScanQR: false 
      }));
      
      setQrScannerOpen(false);
      
      toast({
        title: "¡Asistencia registrada!",
        description: `Has ganado ${event.pointsEarned} puntos y ${event.volunteerHours} horas de voluntariado.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrar asistencia",
        variant: "destructive",
      });
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${searchEmail}%,last_name.ilike.%${searchEmail}%`)
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  const handleManualCheckIn = async (userId: string, userName: string) => {
    if (!id) return;

    try {
      const { error } = await supabase.rpc('award_event_points', {
        p_user_id: userId,
        p_event_id: id,
        p_check_in_method: 'manual'
      });

      if (error) throw error;

      toast({
        title: "Asistencia registrada",
        description: `${userName} ha sido marcado como asistente`,
      });

      setSearchEmail('');
      setSearchResults([]);
      setManualCheckInOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrar asistencia",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Función de compartir",
      description: "La funcionalidad para compartir se implementaría aquí",
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!event) {
    return (
      <div className="app-container p-4">
        <h1 className="text-xl font-bold">Evento no encontrado</h1>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver al Inicio
        </Button>
      </div>
    );
  }

  const isAdmin = user?.accountType === 'admin';

  return (
    <div className="app-container p-3">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/events')}
        className="mb-3 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>
      
      {event.image && (
        <div className="w-full mb-3 rounded-lg overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-48 sm:h-56 md:h-64 object-cover" 
            onError={(e) => {
              console.error('Failed to load event image:', event.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <Card className="max-h-[calc(100vh-140px)]">
        <div className="overflow-y-auto scroll-smooth max-h-[calc(100vh-140px)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="flex items-center">
              <CalendarCheck size={16} className="mr-2 text-nuevagen-blue" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-nuevagen-pink" />
              <span>{formatEventTime(event.time, event.endTime)}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-nuevagen-green" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-nuevagen-purple" />
              <div className="flex-1">
                {event.registeredParticipants && event.registeredParticipants.length > 0 ? (
                  <EventParticipants 
                    participants={event.registeredParticipants} 
                    totalCount={event.participantCount} 
                  />
                ) : (
                  <span>{event.participantCount} participantes</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Award size={16} className="mr-2 text-nuevagen-yellow" />
              <span>{event.volunteerHours} horas de voluntariado</span>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h3 className="font-medium mb-2">Acerca de este evento</h3>
            <div className="text-gray-600 max-h-[200px] overflow-y-auto scroll-smooth pr-2">
              <p>{event.description}</p>
            </div>
          </div>
          
          {event.fundingRequired && event.fundingRequired > 0 && (
            <div className="border rounded-lg p-4 mb-4 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="text-green-600" size={18} />
                  {(event.currentFunding || 0) >= event.fundingRequired ? (
                    <span className="text-green-700">¡Fondos Recaudados!</span>
                  ) : (
                    'Financiar Evento'
                  )}
                </h3>
                <Button 
                  size="sm" 
                  onClick={() => setDonationModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign size={16} className="mr-1" />
                  Donar
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-medium">
                    ${event.currentFunding || 0} recaudado
                  </span>
                  <span className="text-gray-600">
                    Meta: ${event.fundingRequired}
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, ((event.currentFunding || 0) / event.fundingRequired) * 100)} 
                  className="h-2"
                />
                {(event.currentFunding || 0) >= event.fundingRequired ? (
                  <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle size={14} />
                    ¡Meta alcanzada! Gracias por tu apoyo.
                  </p>
                ) : (
                  <p className="text-xs text-gray-600">
                    ${Math.max(0, event.fundingRequired - (event.currentFunding || 0))} restante para alcanzar la meta
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-sm text-gray-600">Puntos por participación</p>
                <p className="font-medium text-lg text-nuevagen-blue">{event.pointsEarned} puntos</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Crédito de horas de voluntariado</p>
                <p className="font-medium text-lg text-nuevagen-yellow">{event.volunteerHours} horas</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => setQrScannerOpen(true)}
                >
                  <QrCode size={16} className="mr-2" />
                  Escanear QR
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700" 
                  onClick={() => setManualCheckInOpen(true)}
                >
                  <UserPlus size={16} className="mr-2" />
                  Check-in Manual
                </Button>
              </>
            ) : registrationStatus.canScanQR ? (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={() => setQrScannerOpen(true)}
              >
                <QrCode size={16} className="mr-2" />
                Escanear QR para Asistencia
              </Button>
            ) : registrationStatus.hasAttended ? (
              <Button className="flex-1 bg-green-600" disabled>
                <CheckCircle size={16} className="mr-2" />
                Asistencia Registrada
              </Button>
            ) : registrationStatus.canRegister ? (
              <Button 
                className="flex-1" 
                onClick={handleRegisterForReminder}
                variant="outline"
              >
                <Calendar size={16} className="mr-2" />
                Registrarse para Recordatorio
              </Button>
            ) : registrationStatus.isRegistered ? (
              <Button className="flex-1" disabled>
                <Calendar size={16} className="mr-2" />
                Registrado
              </Button>
            ) : (
              <Button className="flex-1" disabled>
                Evento Completado
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="shrink-0"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </CardContent>
        </div>
      </Card>

      {event.fundingRequired && (
        <EventDonationModal
          eventId={event.id}
          eventTitle={event.title}
          fundingRequired={event.fundingRequired}
          currentFunding={event.currentFunding || 0}
          pointsEarned={event.pointsEarned}
          isOpen={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
        />
      )}

      <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear QR para Registrar Asistencia</DialogTitle>
          </DialogHeader>
          <QRScanner
            onSuccess={handleQRScanSuccess}
            onClose={() => setQrScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={manualCheckInOpen} onOpenChange={setManualCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in Manual de Asistencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar usuario por nombre</Label>
              <div className="flex gap-2">
                <Input
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Nombre del usuario"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                />
                <Button onClick={handleSearchUser}>Buscar</Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Resultados:</Label>
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{result.first_name} {result.last_name}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleManualCheckIn(result.id, `${result.first_name} ${result.last_name}`)}
                    >
                      Marcar Asistencia
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
