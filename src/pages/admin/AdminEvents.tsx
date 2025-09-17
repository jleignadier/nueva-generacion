import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, Edit, Trash2, Users, Search, Trophy, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteEvent(id);
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado exitosamente",
      });
    }
  };

  // Competition management functions
  const handleCompetitionSubmit = (e) => {
    e.preventDefault();
    if (editingCompetition) {
      updateCompetition(editingCompetition.id, competitionForm);
      toast({
        title: "Competencia actualizada",
        description: "La competencia ha sido actualizada exitosamente",
      });
    } else {
      addCompetition(competitionForm);
      toast({
        title: "Competencia creada",
        description: "La competencia ha sido creada exitosamente",
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
    if (confirm('¿Estás seguro de que quieres eliminar esta competencia?')) {
      deleteCompetition(id);
      toast({
        title: "Competencia eliminada",
        description: "La competencia ha sido eliminada exitosamente",
      });
    }
  };

  const resetCompetitionForm = () => {
    setEditingCompetition(null);
    setCompetitionForm({ name: '', prize: '', endDate: '', isActive: true });
  };

  // Filter events based on date-based status and search query
  const filteredEvents = events.filter(event => {
    // Determine actual status based on date
    const today = new Date();
    const eventDate = new Date(event.date);
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    let actualStatus: string;
    if (eventDate > today) {
      actualStatus = 'upcoming';
    } else {
      actualStatus = 'completed';
    }
    
    const matchesFilter = filter === 'all' || actualStatus === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        <h1 className="text-2xl sm:text-3xl font-bold">Administración de Eventos</h1>
      </div>

      {/* Competition Management Section */}
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="flex items-center gap-2 text-xl text-white font-semibold">
              <Trophy className="text-yellow-500" size={24} />
              Administración de Competencias
            </h3>
            <Dialog open={isCompetitionDialogOpen} onOpenChange={setIsCompetitionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                  onClick={resetCompetitionForm}
                >
                  <Plus size={16} className="mr-2" />
                  Crear Competencia
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-popover-foreground">
                    {editingCompetition ? 'Editar Competencia' : 'Crear Nueva Competencia'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCompetitionSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-popover-foreground">Nombre de la Competencia</Label>
                    <Input
                      id="name"
                      value={competitionForm.name}
                      onChange={(e) => setCompetitionForm({...competitionForm, name: e.target.value})}
                      placeholder="Ingresa el nombre de la competencia"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize" className="text-popover-foreground">Premio</Label>
                    <Input
                      id="prize"
                      value={competitionForm.prize}
                      onChange={(e) => setCompetitionForm({...competitionForm, prize: e.target.value})}
                      placeholder="Ingresa la descripción del premio"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-popover-foreground">Fecha de Finalización</Label>
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
                    <Label htmlFor="isActive" className="text-popover-foreground">Competencia Activa</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingCompetition ? 'Actualizar' : 'Crear'} Competencia
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCompetitionDialogOpen(false)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div>
          {competitions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No se han creado competencias aún
            </div>
          ) : (
            <div className="space-y-3">
              {competitions.map((competition) => (
                <div key={competition.id} className="border border-border rounded-lg p-4 bg-zinc-700/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1 text-white">{competition.name}</h3>
                      <div className="text-sm text-zinc-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <Trophy size={14} />
                          <span>Premio: {competition.prize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Termina: {new Date(competition.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          competition.isActive 
                             ? 'bg-green-900/30 text-green-400' 
                             : 'bg-muted text-zinc-400'
                         }`}>
                          {competition.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCompetition(competition)}
                          className="border-border text-white bg-muted/50 hover:bg-muted flex-1 sm:flex-initial"
                        >
                          <Edit size={14} className="mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCompetition(competition.id)}
                          className="flex-1 sm:flex-initial"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              className="border-border text-white hover:bg-muted hover:text-white text-xs sm:text-sm"
            >
              Todos los Eventos
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="upcoming" 
              className="border-border text-white hover:bg-muted hover:text-white text-xs sm:text-sm"
            >
              Próximos
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="completed" 
              className="border-border text-white hover:bg-muted hover:text-white text-xs sm:text-sm"
            >
              Completados
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-40">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
              <Input 
                placeholder="Buscar eventos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border text-white placeholder:text-zinc-400"
              />
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white w-full sm:w-auto whitespace-nowrap"
              onClick={() => navigate('/admin/events/create')}
            >
              Crear Nuevo Evento
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No se encontraron eventos que coincidan con tus criterios
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border border-border rounded-lg p-4 bg-zinc-700/50">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg mb-2 break-words text-white">{event.title}</h3>
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
                        <span>
                          {event.participantCount} participantes
                          {event.registeredParticipants && (
                            <span className="text-xs ml-1">
                              ({event.registeredParticipants.filter(p => p.type === 'user').length}u, {event.registeredParticipants.filter(p => p.type === 'organization').length}o)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span>{event.pointsEarned} puntos</span>
                      </div>
                      <div className="flex items-center">
                        <span>{event.volunteerHours}h crédito voluntario</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border text-white bg-muted/50 hover:bg-muted hover:text-white flex-1 lg:flex-initial"
                      onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex-1 lg:flex-initial"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
                {event.status === 'completed' && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                      Completado
                    </span>
                  </div>
                )}
                {event.status === 'upcoming' && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      Próximo
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