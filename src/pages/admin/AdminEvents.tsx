import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, Edit, Trash2, Users, Search, Trophy, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEventsStore } from '@/store/eventsStore';
import { useCompetitionsStore } from '@/store/competitionsStore';

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, deleteEvent } = useEventsStore();
  const { competitions, addCompetition, updateCompetition, deleteCompetition } = useCompetitionsStore();
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompetitionDialogOpen, setIsCompetitionDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [competitionForm, setCompetitionForm] = useState({
    name: '',
    prize: '',
    endDate: '',
    isActive: true
  });

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

  // Competition management functions
  const handleCompetitionSubmit = (e) => {
    e.preventDefault();
    if (editingCompetition) {
      updateCompetition(editingCompetition.id, competitionForm);
      toast({
        title: "Competition updated",
        description: "The competition has been successfully updated",
      });
    } else {
      addCompetition(competitionForm);
      toast({
        title: "Competition created",
        description: "The competition has been successfully created",
      });
    }
    setIsCompetitionDialogOpen(false);
    setEditingCompetition(null);
    setCompetitionForm({ name: '', prize: '', endDate: '', isActive: true });
  };

  const handleEditCompetition = (competition) => {
    setEditingCompetition(competition);
    setCompetitionForm({
      name: competition.name,
      prize: competition.prize,
      endDate: competition.endDate,
      isActive: competition.isActive
    });
    setIsCompetitionDialogOpen(true);
  };

  const handleDeleteCompetition = (id: string) => {
    if (confirm('Are you sure you want to delete this competition?')) {
      deleteCompetition(id);
      toast({
        title: "Competition deleted",
        description: "The competition has been successfully removed",
      });
    }
  };

  const resetCompetitionForm = () => {
    setEditingCompetition(null);
    setCompetitionForm({ name: '', prize: '', endDate: '', isActive: true });
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

      {/* Competition Management Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Trophy className="text-yellow-500" size={24} />
              Competition Management
            </CardTitle>
            <Dialog open={isCompetitionDialogOpen} onOpenChange={setIsCompetitionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                  onClick={resetCompetitionForm}
                >
                  <Plus size={16} className="mr-2" />
                  Create Competition
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-popover-foreground">
                    {editingCompetition ? 'Edit Competition' : 'Create New Competition'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCompetitionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-popover-foreground">Competition Name</Label>
                    <Input
                      id="name"
                      value={competitionForm.name}
                      onChange={(e) => setCompetitionForm({...competitionForm, name: e.target.value})}
                      placeholder="Enter competition name"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize" className="text-popover-foreground">Prize</Label>
                    <Input
                      id="prize"
                      value={competitionForm.prize}
                      onChange={(e) => setCompetitionForm({...competitionForm, prize: e.target.value})}
                      placeholder="Enter prize description"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-popover-foreground">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={competitionForm.endDate}
                      onChange={(e) => setCompetitionForm({...competitionForm, endDate: e.target.value})}
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={competitionForm.isActive}
                      onCheckedChange={(checked) => setCompetitionForm({...competitionForm, isActive: checked})}
                    />
                    <Label htmlFor="isActive" className="text-popover-foreground">Active Competition</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingCompetition ? 'Update' : 'Create'} Competition
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCompetitionDialogOpen(false)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {competitions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No competitions created yet
            </div>
          ) : (
            <div className="space-y-3">
              {competitions.map((competition) => (
                <div key={competition.id} className="border border-border rounded-lg p-4 bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1 text-foreground">{competition.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Trophy size={14} />
                          <span>Prize: {competition.prize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Ends: {new Date(competition.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          competition.isActive 
                             ? 'bg-green-900/30 text-green-400' 
                             : 'bg-muted text-muted-foreground'
                         }`}>
                          {competition.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCompetition(competition)}
                          className="border-border text-foreground bg-muted hover:bg-muted/80 flex-1 sm:flex-initial"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCompetition(competition.id)}
                          className="flex-1 sm:flex-initial"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-card border border-border p-6 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <ToggleGroup 
            type="single" 
            value={filter}
            onValueChange={(value) => value && setFilter(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem 
              value="all" 
              className="border-border text-foreground hover:bg-muted hover:text-foreground text-xs sm:text-sm"
            >
              All Events
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="upcoming" 
              className="border-border text-foreground hover:bg-muted hover:text-foreground text-xs sm:text-sm"
            >
              Upcoming
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="completed" 
              className="border-border text-foreground hover:bg-muted hover:text-foreground text-xs sm:text-sm"
            >
              Completed
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events found matching your criteria
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border border-border rounded-lg p-4 bg-muted">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg mb-2 break-words text-foreground">{event.title}</h3>
                    <div className="flex flex-wrap items-center text-muted-foreground text-sm gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <CalendarCheck size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{formatTime(event.time, event.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center text-muted-foreground text-sm mt-1 gap-x-4 gap-y-1">
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
                      <div className="flex items-center">
                        <span>{event.volunteerHours}h volunteer credit</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border text-foreground bg-muted/50 hover:bg-muted hover:text-foreground flex-1 lg:flex-initial"
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
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
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
