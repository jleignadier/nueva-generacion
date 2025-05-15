
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Users, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEventsStore } from '@/store/eventsStore';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParticipating, setIsParticipating] = useState(false);
  
  const { getEvent } = useEventsStore();
  
  // Find the event based on the ID parameter
  const event = id ? getEvent(id) : undefined;
  
  // Check localStorage on initial load to see if user is already participating
  useEffect(() => {
    const participatingEvents = JSON.parse(localStorage.getItem('participatingEvents') || '[]');
    setIsParticipating(participatingEvents.includes(id));
  }, [id]);

  if (!event) {
    return (
      <div className="app-container p-4">
        <h1 className="text-xl font-bold">Event not found</h1>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Button>
      </div>
    );
  }

  const handleParticipate = () => {
    // In a real app, this would make an API call to register the user
    setIsParticipating(true);
    
    // Show success toast
    toast({
      title: "You're registered!",
      description: `You've successfully signed up for ${event.title}`,
    });
    
    // Mock saving participation to localStorage for demonstration
    const participatingEvents = JSON.parse(localStorage.getItem('participatingEvents') || '[]');
    if (!participatingEvents.includes(event.id)) {
      participatingEvents.push(event.id);
      localStorage.setItem('participatingEvents', JSON.stringify(participatingEvents));
    }
  };

  const handleShare = () => {
    // In a real app, this would open a proper share dialog
    toast({
      title: "Share feature",
      description: "Sharing functionality would be implemented here",
    });
  };

  // Use direct route for navigation - maintain the '/dashboard' path
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
        Back
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
              <span>{event.participantCount} participants</span>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h3 className="font-medium mb-2">About this event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Points for participation</p>
              <p className="font-medium text-lg text-nuevagen-blue">{event.pointsEarned} points</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleParticipate}
              disabled={isParticipating}
            >
              {isParticipating ? 'Registered' : 'Participate'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShare}
            >
              <Share2 size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetail;
