
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Clock, MapPin, Award, ChevronRight } from 'lucide-react';
import { useEventsStore, Event } from '@/store/eventsStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatEventTime, getTodayString } from '@/utils/dateUtils';

const HomeTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  
  // Filter events to show all upcoming events and today's events (visible until end of day)
  const upcomingEvents = events
    .filter(event => {
      const today = getTodayString(); // Get YYYY-MM-DD format
      // Show all future events and today's events (remain visible all day regardless of attendance)
      return event.date >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date string
  
  const nextEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1, 4);
  
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
                  <span>{formatEventTime(nextEvent.time, nextEvent.endTime)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white" 
                size="sm"
                onClick={() => navigate(`/dashboard/events/${nextEvent.id}`)}
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
                      <span>{formatEventTime(event.time, event.endTime)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3 btn-primary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/events/${event.id}`)}
                    variant={getEventStatus(event.id).status === 'attended' ? 'secondary' : 'default'}
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
