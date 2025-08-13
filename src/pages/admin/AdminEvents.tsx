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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Events Management</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white w-full sm:w-auto"
          onClick={() => navigate('/admin/events/create')}
        >
          Create New Event
        </Button>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && setFilter(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem 
              value="all" 
              className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white text-xs sm:text-sm"
            >
              All Events
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="upcoming" 
              className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white text-xs sm:text-sm"
            >
              Upcoming
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="completed" 
              className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white text-xs sm:text-sm"
            >
              Completed
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="relative w-full lg:w-64">
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
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg mb-2 break-words">{event.title}</h3>
                    <div className="flex flex-wrap items-center text-zinc-400 text-sm gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <CalendarCheck size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{formatTime(event.time, event.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center text-zinc-400 text-sm mt-1 gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1 flex-shrink-0" />
                        <span>{event.participantCount} participants</span>
                      </div>
                      <div className="flex items-center">
                        <span>{event.pointsEarned} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-zinc-600 text-black bg-white hover:bg-gray-100 hover:text-black flex-1 lg:flex-initial"
                      onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex-1 lg:flex-initial"
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
