
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomeTab = () => {
  const { user } = useAuth();
  
  const upcomingEvents = [
    {
      id: 1,
      title: 'Beach Cleanup',
      organization: 'EcoGuardians',
      location: 'Santa Monica Beach',
      date: 'May 20, 2025',
      time: '9:00 AM - 12:00 PM',
      participants: 18
    },
    {
      id: 2,
      title: 'Food Drive',
      organization: 'Community Helpers',
      location: 'Central Park',
      date: 'May 25, 2025',
      time: '10:00 AM - 2:00 PM',
      participants: 24
    },
    {
      id: 3,
      title: 'Tutoring Session',
      organization: 'Education For All',
      location: 'Public Library',
      date: 'May 27, 2025',
      time: '4:00 PM - 6:00 PM',
      participants: 12
    },
    {
      id: 4,
      title: 'Community Garden',
      organization: 'Green Thumbs',
      location: 'Riverside Park',
      date: 'June 2, 2025',
      time: '10:00 AM - 1:00 PM',
      participants: 15
    }
  ];

  const nextEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1, 4);

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
      
      <Card className="mb-6 bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal">
        <CardContent className="p-6">
          <div className="flex flex-col text-white">
            <span className="text-lg font-medium opacity-90">Your Impact</span>
            <span className="text-3xl font-bold mt-1">12</span>
            <span className="text-sm mt-1">Volunteer Hours This Month</span>
            <Button 
              variant="outline" 
              className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/40"
            >
              View All Activities
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Next Event</h2>
        <Card key={nextEvent.id} className="overflow-hidden mb-6">
          <div className="border-l-4 border-nuevagen-pink h-full">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{nextEvent.title}</CardTitle>
              <p className="text-sm text-gray-600">{nextEvent.organization}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1 text-nuevagen-blue" />
                  <span>{nextEvent.location}</span>
                </div>
                <div className="flex items-center">
                  <Users size={14} className="mr-1 text-nuevagen-purple" />
                  <span>{nextEvent.participants} joining</span>
                </div>
                <div className="flex items-center">
                  <CalendarCheck size={14} className="mr-1 text-nuevagen-pink" />
                  <span>{nextEvent.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-nuevagen-green" />
                  <span>{nextEvent.time}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-3 btn-primary" 
                size="sm"
              >
                Join Event
              </Button>
            </CardContent>
          </div>
        </Card>

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
          <Button 
            variant="ghost" 
            className="text-sm text-nuevagen-blue"
            size="sm"
          >
            See All
          </Button>
        </div>
        <div className="space-y-4">
          {otherEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="border-l-4 border-nuevagen-teal h-full">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <p className="text-sm text-gray-600">{event.organization}</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 text-nuevagen-blue" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="mr-1 text-nuevagen-purple" />
                      <span>{event.participants} joining</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarCheck size={14} className="mr-1 text-nuevagen-pink" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-nuevagen-green" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3 btn-primary" 
                    size="sm"
                  >
                    Join Event
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
