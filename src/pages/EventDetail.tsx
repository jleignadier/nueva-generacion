
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Users, Share2, ScanQrCode, Award, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEventsStore } from '@/store/eventsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRScanner from '@/components/QRScanner';
import { getEventRegistrationStatus, registerForEvent, markEventAttended, downloadCalendarFile, isEventToday } from '@/utils/eventUtils';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    hasAttended: false,
    canScanQR: false,
    canRegister: false,
    isEventPast: false
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const { getEvent } = useEventsStore();
  
  // Find the event based on the ID parameter
  const event = id ? getEvent(id) : undefined;
  
  // Check registration and attendance status
  useEffect(() => {
    if (id && event) {
      const status = getEventRegistrationStatus(id, event.date);
      setRegistrationStatus(status);
    }
  }, [id, event]);

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

  const handleRegisterForReminder = () => {
    if (!event || !id) return;
    
    // Register for the event (calendar reminder)
    registerForEvent(id);
    
    // Download calendar file
    downloadCalendarFile({
      title: event.title,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      location: event.location,
      description: event.description
    });
    
    // Update local state
    setRegistrationStatus(prev => ({ ...prev, isRegistered: true, canRegister: false }));
    
    // Show success toast
    toast({
      title: "¡Registrado para recordatorio!",
      description: `Evento de calendario agregado para ${event.title}. Recuerda escanear el código QR el día del evento para confirmar asistencia.`,
    });
  };

  const handleScanQR = () => {
    // Only allow QR scanning on the event day
    if (!event || !isEventToday(event.date)) {
      toast({
        title: "Escaneo de QR no disponible",
        description: "El escaneo de código QR solo está disponible el día del evento.",
        variant: "destructive"
      });
      return;
    }
    setScannerOpen(true);
  };

  const handleQRSuccess = (result: string) => {
    if (!event || !id) return;
    
    // Close the scanner
    setScannerOpen(false);

    // Validate the QR code - in a real app this would verify if the QR code 
    // matches the event ID or contains a valid participation token
    if (result.includes(event.id) || result === 'valid-qr-code') {
      // Mark attendance
      markEventAttended(id);
      
      // Update local state
      setRegistrationStatus(prev => ({ ...prev, hasAttended: true, canScanQR: false }));
      
      // Show success toast
      toast({
        title: "¡Asistencia registrada!",
        description: `Te has registrado exitosamente en ${event.title}. Se han otorgado puntos y horas de voluntariado.`,
      });
    } else {
      // Invalid QR code
      toast({
        title: "Código QR Inválido",
        description: "El código QR escaneado no es válido para este evento.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // In a real app, this would open a proper share dialog
    toast({
      title: "Función de compartir",
      description: "La funcionalidad para compartir se implementaría aquí",
    });
  };

  // Use direct route for navigation - maintain the '/dashboard' path
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (startTime: string, endTime?: string) => {
    const formatTimeString = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    if (!endTime) return formatTimeString(startTime);
    return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
  };

  return (
    <div className="app-container p-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft size={16} className="mr-2" />
        Volver
      </Button>
      
      <div className="rounded-lg overflow-hidden mb-4">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover" 
        />
      </div>
      
      <Card>
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
              <span>{formatTime(event.time, event.endTime)}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-nuevagen-green" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-nuevagen-purple" />
              <span>{event.participantCount} participantes</span>
            </div>
            <div className="flex items-center">
              <Award size={16} className="mr-2 text-nuevagen-yellow" />
              <span>{event.volunteerHours} horas de voluntariado</span>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h3 className="font-medium mb-2">Acerca de este evento</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
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
            {registrationStatus.hasAttended ? (
              <Button className="flex-1" disabled variant="secondary">
                <CheckCircle size={16} className="mr-2" />
                Asistido ✓
              </Button>
            ) : registrationStatus.canScanQR ? (
              <Button 
                className="flex-1" 
                onClick={handleScanQR}
              >
                <ScanQrCode size={16} className="mr-2" />
                Escanear QR para Asistencia
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
            ) : registrationStatus.isRegistered && !registrationStatus.hasAttended ? (
              <Button className="flex-1" disabled>
                <Calendar size={16} className="mr-2" />
                {registrationStatus.canScanQR ? 'Registrado - Escanear QR Hoy' : 'Registrado'}
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
      </Card>

      {/* QR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear Código QR del Evento para Asistencia</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Escanear este código QR marcará tu asistencia y te otorgará {event?.pointsEarned} puntos 
              y {event?.volunteerHours} horas de voluntariado.
            </p>
          </div>
          <QRScanner onSuccess={handleQRSuccess} onClose={() => setScannerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
