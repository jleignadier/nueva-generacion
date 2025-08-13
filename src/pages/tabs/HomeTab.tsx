
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEventsStore, Event } from '@/store/eventsStore';
import { format, parseISO } from 'date-fns';

const HomeTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useEventsStore();
  
  // Check if we're on the events page (showing all events)
  const isEventsPage = location.pathname === '/events';
  
  // Filter upcoming events and sort by date
  const upcomingEvents = events
    .filter(event => event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextEvent = upcomingEvents[0];
  const otherEvents = isEventsPage ? upcomingEvents.slice(1) : upcomingEvents.slice(1, 4);
  
  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
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
  
  // Check if user is participating in events (from localStorage)
  const getIsParticipating = (eventId: string) => {
    const participatingEvents = JSON.parse(localStorage.getItem('participatingEvents') || '[]');
    return participatingEvents.includes(eventId);
  };

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hello, {user?.name}
        </h1>
        <div className="h-10 w-10 rounded-full bg-nuevagen-purple text-white flex items-center justify-center font-medium">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Next Event</h2>
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
                onClick={() => navigate(`/event/${nextEvent.id}`)}
              >
                {getIsParticipating(nextEvent.id) ? 'View Details' : 'Participate Now'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-l-4 border-nuevagen-pink bg-gray-100">
            <CardContent className="p-4">
              <p className="text-center text-gray-500 py-4">No upcoming events</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEventsPage ? 'All Upcoming Events' : 'Upcoming Events'}
          </h2>
          {!isEventsPage && (
            <Button 
              variant="ghost" 
              className="text-sm text-nuevagen-blue flex items-center"
              size="sm"
              onClick={() => navigate('/events')}
            >
              See All
              <ChevronRight size={16} />
            </Button>
          )}
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
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    {getIsParticipating(event.id) ? 'View Details' : 'Participate'}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-l-4 border-nuevagen-teal bg-gray-100">
              <CardContent className="p-4">
                <p className="text-center text-gray-500 py-4">No additional upcoming events</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
