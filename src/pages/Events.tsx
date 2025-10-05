import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Award } from 'lucide-react';
import { useEventsStore, Event } from '@/store/eventsStore';
import { formatDate, formatEventTime, getTodayString } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';

const Events = () => {
  const navigate = useNavigate();
  const { events } = useEventsStore();
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status and fetch events
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      // If user is not authenticated, fetch from public view
      if (!user) {
        const { data, error } = await supabase
          .from('events_public')
          .select('*')
          .gte('date', getTodayString())
          .order('date', { ascending: true });
        
        if (!error && data) {
          setPublicEvents(data as any);
        }
      }
    };
    
    checkAuth();
  }, []);
  
  console.log('Events page - All events:', events);
  
  // Use authenticated events if logged in, otherwise use public events
  const eventsToShow = isAuthenticated ? events : publicEvents;
  
  // Filter events to show all upcoming events and today's events (visible until end of day)
  const upcomingEvents = eventsToShow
    .filter(event => {
      const today = getTodayString(); // Get YYYY-MM-DD format
      // Show all future events and today's events (remain visible all day regardless of attendance)
      return event.date >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date string
  
  console.log('Events page - Upcoming events:', upcomingEvents);
  
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
                    <span>{formatEventTime(event.time, event.endTime)}</span>
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