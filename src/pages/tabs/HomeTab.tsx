
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEventsStore, Event } from '@/store/eventsStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HomeTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  
  // Filter upcoming events and sort by date (using date-based status)
  const upcomingEvents = events
    .filter(event => {
      const today = new Date();
      const eventDate = new Date(event.date);
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today; // Include today and future events
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  
  const nextEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1, 4);
  
  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy', { locale: es });
  };
  
  // Format time from 24h to 12h format
  const formatEventTime = (event: Event) => {
    if (!event.time) return '';
    
    const formatTimeString = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    if (!event.endTime) return formatTimeString(event.time);
    return `${formatTimeString(event.time)} - ${formatTimeString(event.endTime)}`;
  };
  
  // Function to check event status
  const getEventStatus = (eventId: string) => {
    const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
    const attendedEvents = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
    
    const isRegistered = registeredEvents.includes(eventId);
    const hasAttended = attendedEvents.includes(eventId);
    
    if (hasAttended) return { status: 'attended', text: 'Asistido ✓' };
    if (isRegistered) return { status: 'registered', text: 'Registrado' };
    return { status: 'available', text: 'Ver Detalles' };
  };

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {user?.name}
        </h1>
        <div className="h-10 w-10 rounded-full bg-nuevagen-purple text-white flex items-center justify-center font-medium">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Próximo Evento</h2>
        {nextEvent ? (
          <Card key={nextEvent.id} className="overflow-hidden mb-6 border-l-4 border-nuevagen-pink bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal text-white">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xl md:text-2xl">{nextEvent.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1 text-white" />
                  <span>{nextEvent.location}</span>
                </div>
                <div className="flex items-center">
                  <CalendarCheck size={14} className="mr-1 text-white" />
                  <span>{formatDate(nextEvent.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-white" />
                  <span>{formatEventTime(nextEvent)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white" 
                size="sm"
                onClick={() => navigate(`/dashboard/events/${nextEvent.id}`)}
                disabled={getEventStatus(nextEvent.id).status === 'attended'}
              >
                {getEventStatus(nextEvent.id).text}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-l-4 border-nuevagen-pink bg-gray-100">
            <CardContent className="p-4">
              <p className="text-center text-gray-500 py-4">No hay eventos próximos</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Próximos Eventos</h2>
          <Button 
            variant="ghost" 
            className="text-sm text-nuevagen-blue flex items-center"
            size="sm"
            onClick={() => navigate('/events')}
          >
            Ver Todos
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="space-y-4">
          {otherEvents.length > 0 ? (
            otherEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden border-l-4 border-nuevagen-teal">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg md:text-xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 text-nuevagen-blue" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarCheck size={14} className="mr-1 text-nuevagen-pink" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-nuevagen-green" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3 btn-primary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/events/${event.id}`)}
                    variant={getEventStatus(event.id).status === 'attended' ? 'secondary' : 'default'}
                    disabled={getEventStatus(event.id).status === 'attended'}
                  >
                    {getEventStatus(event.id).text}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-l-4 border-nuevagen-teal bg-gray-100">
              <CardContent className="p-4">
                <p className="text-center text-gray-500 py-4">No hay eventos adicionales próximos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
