
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Users, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock data - would come from API in a real implementation
const eventsMockData = [
  {
    id: '1',
    title: 'Beach Cleanup',
    location: 'Santa Monica Beach',
    date: 'May 20, 2025',
    time: '9:00 AM - 12:00 PM',
    description: 'Join us for a community beach cleanup! We'll be removing trash and debris from the shoreline to protect marine life and keep our beaches beautiful.',
    participantCount: 24,
    pointsEarned: 50,
    image: 'https://placehold.co/600x400/png?text=Beach+Cleanup'
  },
  {
    id: '2',
    title: 'Food Drive',
    location: 'Central Park',
    date: 'May 25, 2025',
    time: '10:00 AM - 2:00 PM',
    description: 'Help us collect food donations for local food banks. Bring non-perishable items to support families in need in our community.',
    participantCount: 18,
    pointsEarned: 40,
    image: 'https://placehold.co/600x400/png?text=Food+Drive'
  },
  {
    id: '3',
    title: 'Tutoring Session',
    location: 'Public Library',
    date: 'May 27, 2025',
    time: '4:00 PM - 6:00 PM',
    description: 'Volunteer to tutor students in math, science, and reading. Help young students improve their academic skills and confidence.',
    participantCount: 12,
    pointsEarned: 30,
    image: 'https://placehold.co/600x400/png?text=Tutoring+Session'
  },
  {
    id: '4',
    title: 'Community Garden',
    location: 'Riverside Park',
    date: 'June 2, 2025',
    time: '10:00 AM - 1:00 PM',
    description: 'Help plant and maintain our community garden. Learn about sustainable gardening practices while beautifying our neighborhood.',
    participantCount: 15,
    pointsEarned: 45,
    image: 'https://placehold.co/600x400/png?text=Community+Garden'
  }
];

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParticipating, setIsParticipating] = useState(false);

  // Find the event based on the ID parameter
  const event = eventsMockData.find(e => e.id === id);

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

  return (
    <div className="app-container p-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
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
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-nuevagen-pink" />
              <span>{event.time}</span>
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
