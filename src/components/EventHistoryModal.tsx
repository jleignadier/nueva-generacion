import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Award, Trophy, Clock } from 'lucide-react';
import { useEventsStore } from '@/store/eventsStore';

interface EventHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventHistoryModal: React.FC<EventHistoryModalProps> = ({ isOpen, onClose }) => {
  const { events } = useEventsStore();

  // Get attended events from localStorage and match with event details
  const attendedEvents = useMemo(() => {
    const attendedEventIds = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
    return attendedEventIds.map((eventId: string) => {
      const event = events.find(e => e.id === eventId);
      return {
        id: eventId,
        name: event?.title || 'Evento Desconocido',
        date: event?.date || new Date().toISOString(),
        location: event?.location || 'Ubicación Desconocida',
        hours: 3, // Estimate
        points: 40 // Estimate
      };
    });
  }, [events]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      attended: attendedEvents.length,
      hours: attendedEvents.reduce((sum, e) => sum + e.hours, 0),
      points: attendedEvents.reduce((sum, e) => sum + e.points, 0)
    };
  }, [attendedEvents]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar size={20} className="mr-2 text-primary" />
            Historial de Eventos
          </DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <Calendar size={16} className="mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Eventos</p>
                <p className="font-semibold">{stats.attended}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <Clock size={16} className="mx-auto mb-1 text-secondary" />
                <p className="text-xs text-muted-foreground">Horas</p>
                <p className="font-semibold">{stats.hours}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <Trophy size={16} className="mx-auto mb-1 text-amber-500" />
                <p className="text-xs text-muted-foreground">Puntos</p>
                <p className="font-semibold">{stats.points}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {attendedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p>No has asistido a eventos aún</p>
              <p className="text-xs">Escanea códigos QR en eventos para empezar</p>
            </div>
          ) : (
            attendedEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="mr-1 text-secondary" />
                        <span className="text-sm">{event.hours}h</span>
                      </div>
                      <div className="flex items-center">
                        <Trophy size={14} className="mr-1 text-amber-500" />
                        <span className="text-sm">{event.points}pts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Button onClick={onClose} className="w-full mt-4">
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EventHistoryModal;