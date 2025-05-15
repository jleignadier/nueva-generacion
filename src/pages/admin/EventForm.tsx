
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useEventsStore } from '@/store/eventsStore';

interface EventFormData {
  title: string;
  location: string;
  date: string;
  time: string;
  endTime: string;
  description: string;
  pointsEarned: number;
  image: string;
  status: 'upcoming' | 'completed';
}

const EventForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== undefined;
  
  const { getEvent, addEvent, updateEvent } = useEventsStore();
  
  // Get existing event data if editing
  const existingEvent = isEditing ? getEvent(id) : null;
  
  // Set initial state based on whether we're editing or creating
  const [formData, setFormData] = useState<EventFormData>(
    existingEvent ? {
      title: existingEvent.title,
      location: existingEvent.location,
      date: existingEvent.date,
      time: existingEvent.time,
      endTime: existingEvent.endTime || '',
      description: existingEvent.description,
      pointsEarned: existingEvent.pointsEarned,
      image: existingEvent.image,
      status: existingEvent.status
    } : {
      title: '',
      location: '',
      date: '',
      time: '',
      endTime: '',
      description: '',
      pointsEarned: 25,
      image: 'https://placehold.co/600x400/png?text=Event+Image',
      status: 'upcoming'
    }
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pointsEarned' ? Number(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.location || !formData.date || !formData.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Update or create event
    if (isEditing && id) {
      updateEvent(id, {
        ...formData,
        pointsEarned: Number(formData.pointsEarned)
      });
      
      toast({
        title: "Event updated",
        description: `Successfully updated ${formData.title}`
      });
    } else {
      addEvent({
        ...formData,
        pointsEarned: Number(formData.pointsEarned)
      });
      
      toast({
        title: "Event created",
        description: `Successfully created ${formData.title}`
      });
    }
    
    // Navigate back to events list
    navigate('/admin/events');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Event' : 'Create Event'}</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/events')}
          className="text-black bg-white hover:text-black hover:bg-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </div>
      
      <Card className="bg-zinc-800 border border-zinc-700">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Event Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location*</Label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    required
                    className="pl-10 bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Date*</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-white">Start Time*</Label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white">End Time*</Label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  rows={5}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pointsEarned" className="text-white">Points for Participation</Label>
                <Input
                  id="pointsEarned"
                  name="pointsEarned"
                  type="number"
                  min="0"
                  value={formData.pointsEarned}
                  onChange={handleInputChange}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-white">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/events')}
                className="border-zinc-600 hover:bg-zinc-700"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
