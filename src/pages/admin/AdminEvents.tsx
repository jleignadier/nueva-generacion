
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, Edit, Trash2, Users, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

// Mock data - would come from API in a real implementation
const eventsMockData = [
  {
    id: '1',
    title: 'Beach Cleanup',
    location: 'Santa Monica Beach',
    date: 'May 20, 2025',
    time: '9:00 AM - 12:00 PM',
    participantCount: 24,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Food Drive',
    location: 'Central Park',
    date: 'May 25, 2025',
    time: '10:00 AM - 2:00 PM',
    participantCount: 18,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Tutoring Session',
    location: 'Public Library',
    date: 'May 27, 2025',
    time: '4:00 PM - 6:00 PM',
    participantCount: 12,
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'Earth Day Festival',
    location: 'Downtown Square',
    date: 'April 22, 2025',
    time: '12:00 PM - 6:00 PM',
    participantCount: 156,
    status: 'completed'
  }
];

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState(eventsMockData);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Handle deleting an event (mock implementation)
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      // In a real app, this would make an API call to delete the event
      setEvents(events.filter(event => event.id !== id));
      toast({
        title: "Event deleted",
        description: "The event has been successfully removed",
      });
    }
  };

  // Filter events based on status and search query
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
          onClick={() => navigate('/admin/events/create')}
        >
          Create New Event
        </Button>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? "default" : "outline"}
              onClick={() => setFilter('all')}
              className={filter !== 'all' ? "border-zinc-600 hover:bg-zinc-700" : ""}
            >
              All Events
            </Button>
            <Button 
              variant={filter === 'upcoming' ? "default" : "outline"}
              onClick={() => setFilter('upcoming')}
              className={filter !== 'upcoming' ? "border-zinc-600 hover:bg-zinc-700" : ""}
            >
              Upcoming
            </Button>
            <Button 
              variant={filter === 'completed' ? "default" : "outline"}
              onClick={() => setFilter('completed')}
              className={filter !== 'completed' ? "border-zinc-600 hover:bg-zinc-700" : ""}
            >
              Completed
            </Button>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <Input 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-700 border-zinc-600"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No events found matching your criteria
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <div className="flex items-center text-zinc-400 text-sm">
                      <CalendarCheck size={14} className="mr-1" />
                      <span>{event.date}</span>
                      <span className="mx-2">•</span>
                      <Clock size={14} className="mr-1" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-zinc-400 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{event.location}</span>
                      <span className="mx-2">•</span>
                      <Users size={14} className="mr-1" />
                      <span>{event.participantCount} participants</span>
                    </div>
                  </div>
                  <div className="space-x-2 flex items-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-zinc-600 hover:bg-zinc-700"
                      onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                {event.status === 'completed' && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                      Completed
                    </span>
                  </div>
                )}
                {event.status === 'upcoming' && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                      Upcoming
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
