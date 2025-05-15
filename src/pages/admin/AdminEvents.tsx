
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, Edit, Trash2, Users, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEventsStore } from '@/store/eventsStore';

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, deleteEvent } = useEventsStore();
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Handle deleting an event
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
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

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Function to format time for display
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
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && setFilter(value)}
            className="flex gap-2"
          >
            <ToggleGroupItem 
              value="all" 
              className={filter === 'all' 
                ? "bg-white text-black font-medium" 
                : "border-zinc-600 text-white hover:bg-zinc-700 hover:text-white"}
            >
              All Events
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="upcoming" 
              className={filter === 'upcoming' 
                ? "bg-white text-black font-medium" 
                : "border-zinc-600 text-white hover:bg-zinc-700 hover:text-white"}
            >
              Upcoming
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="completed" 
              className={filter === 'completed' 
                ? "bg-white text-black font-medium" 
                : "border-zinc-600 text-white hover:bg-zinc-700 hover:text-white"}
            >
              Completed
            </ToggleGroupItem>
          </ToggleGroup>
          
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
                      <span>{formatDate(event.date)}</span>
                      <span className="mx-2">•</span>
                      <Clock size={14} className="mr-1" />
                      <span>{formatTime(event.time, event.endTime)}</span>
                    </div>
                    <div className="flex items-center text-zinc-400 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{event.location}</span>
                      <span className="mx-2">•</span>
                      <Users size={14} className="mr-1" />
                      <span>{event.participantCount} participants</span>
                      <span className="mx-2">•</span>
                      <span>{event.pointsEarned} points</span>
                    </div>
                  </div>
                  <div className="space-x-2 flex items-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-zinc-600 text-black bg-white hover:bg-gray-100 hover:text-black"
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
