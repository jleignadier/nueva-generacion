import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEventsStore, Event } from '@/store/eventsStore';
import { format, parseISO } from 'date-fns';

const Events = () => {
  const navigate = useNavigate();
  const { events } = useEventsStore();
  
  console.log('Events page - All events:', events);
  
  // Filter upcoming events and sort by date (using string-based date comparison)
  const upcomingEvents = events
    .filter(event => {
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
      return event.date >= today; // Include today and future events (string comparison)
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date string
  
  console.log('Events page - Upcoming events:', upcomingEvents);
  
  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy');
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
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mr-3"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Todos los Eventos</h1>
      </div>
      
      <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden border-l-4 border-nuevagen-teal hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg md:text-xl">{event.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
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
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span className="bg-nuevagen-blue bg-opacity-10 text-nuevagen-blue px-2 py-1 rounded-full">
                      {event.volunteerHours} horas de voluntariado
                    </span>
                  </div>
                  <Button 
                    className="btn-primary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/events/${event.id}`)}
                    variant={getEventStatus(event.id).status === 'attended' ? 'secondary' : 'default'}
                    disabled={getEventStatus(event.id).status === 'attended'}
                  >
                    {getEventStatus(event.id).text}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-l-4 border-nuevagen-teal bg-gray-100">
            <CardContent className="p-6">
              <p className="text-center text-gray-500 py-8">No hay eventos próximos disponibles</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Events;