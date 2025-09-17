
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
  volunteerHours: number;
  image: string;
  status: 'upcoming' | 'completed';
  fundingRequired: number;
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
      volunteerHours: existingEvent.volunteerHours,
      image: existingEvent.image,
      status: existingEvent.status,
      fundingRequired: existingEvent.fundingRequired || 0
    } : {
      title: '',
      location: '',
      date: '',
      time: '',
      endTime: '',
      description: '',
      pointsEarned: 25,
      volunteerHours: 3,
      image: 'https://placehold.co/600x400/png?text=Event+Image',
      status: 'upcoming',
      fundingRequired: 0
    }
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pointsEarned' || name === 'volunteerHours' || name === 'fundingRequired' ? Number(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.location || !formData.date || !formData.time) {
      toast({
        title: "Información faltante",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    // Update or create event
    if (isEditing && id) {
      updateEvent(id, {
        ...formData,
        pointsEarned: Number(formData.pointsEarned),
        volunteerHours: Number(formData.volunteerHours)
      });
      
      toast({
        title: "Evento actualizado",
        description: `Actualizado exitosamente`
      });
    } else {
      addEvent({
        ...formData,
        pointsEarned: Number(formData.pointsEarned),
        volunteerHours: Number(formData.volunteerHours)
      });
      
      toast({
        title: "Evento creado",
        description: `Creado exitosamente`
      });
    }
    
    // Navigate back to events list
    navigate('/admin/events');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? 'Editar Evento' : 'Crear Evento'}</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/events')}
          className="text-black bg-white hover:text-black hover:bg-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Atrás
        </Button>
      </div>
      
      <Card className="bg-zinc-800 border border-zinc-700">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Título del Evento*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ingresa el título del evento"
                  required
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Ubicación*</Label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ingresa la ubicación"
                    required
                    className="pl-10 bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Fecha*</Label>
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
                  <Label htmlFor="time" className="text-white">Hora de Inicio*</Label>
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
                  <Label htmlFor="endTime" className="text-white">Hora de Finalización*</Label>
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
                <Label htmlFor="description" className="text-white">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ingresa la descripción del evento"
                  rows={5}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsEarned" className="text-white">Puntos Obtenidos</Label>
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
                  <Label htmlFor="volunteerHours" className="text-white">Horas de Voluntariado</Label>
                  <Input
                    id="volunteerHours"
                    name="volunteerHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.volunteerHours}
                    onChange={handleInputChange}
                    className="bg-zinc-700 border-zinc-600 text-white"
                    placeholder="Horas para crédito voluntario"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fundingRequired" className="text-white">Fondos Requeridos ($)</Label>
                  <Input
                    id="fundingRequired"
                    name="fundingRequired"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.fundingRequired}
                    onChange={handleInputChange}
                    className="bg-zinc-700 border-zinc-600 text-white"
                    placeholder="Monto objetivo (opcional)"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-white">URL de la Imagen</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Ingresa la URL de la imagen"
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
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {isEditing ? 'Actualizar Evento' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
