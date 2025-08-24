
import { create } from 'zustand';

// Define event types
export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  endTime?: string;
  description: string;
  participantCount: number;
  pointsEarned: number;
  volunteerHours: number; // Admin-set hours for volunteer credit
  status: 'upcoming' | 'completed';
  image: string;
}

// Initial events data
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Limpieza de Playa',
    location: 'Playa Santa Mónica',
    date: '2025-08-26',
    time: '09:00',
    endTime: '12:00',
    description: "¡Únete a nosotros para una limpieza comunitaria de playa! Estaremos removiendo basura y desechos de la orilla para proteger la vida marina y mantener nuestras playas hermosas.",
    participantCount: 24,
    pointsEarned: 50,
    volunteerHours: 4, // Higher than actual 3 hours due to physical effort
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Beach+Cleanup'
  },
  {
    id: '2',
    title: 'Recolección de Alimentos',
    location: 'Parque Central',
    date: '2025-08-28',
    time: '10:00',
    endTime: '14:00',
    description: 'Ayúdanos a recolectar donaciones de alimentos para bancos de alimentos locales. Trae artículos no perecederos para apoyar a familias necesitadas en nuestra comunidad.',
    participantCount: 18,
    pointsEarned: 40,
    volunteerHours: 5, // Higher than actual 4 hours due to organization required
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Food+Drive'
  },
  {
    id: '3',
    title: 'Sesión de Tutoría',
    location: 'Biblioteca Pública',
    date: '2025-08-30',
    time: '16:00',
    endTime: '18:00',
    description: 'Ofrécete como voluntario para dar tutoría a estudiantes en matemáticas, ciencias y lectura. Ayuda a estudiantes jóvenes a mejorar sus habilidades académicas y confianza.',
    participantCount: 12,
    pointsEarned: 30,
    volunteerHours: 3, // Higher than actual 2 hours due to preparation and expertise required
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Tutoring+Session'
  },
  {
    id: '4',
    title: 'Festival del Día de la Tierra',
    location: 'Plaza del Centro',
    date: '2025-04-22',
    time: '12:00',
    endTime: '18:00',
    description: 'Ayuda a plantar y mantener nuestro jardín comunitario. Aprende sobre prácticas de jardinería sostenible mientras embelleces nuestro vecindario.',
    participantCount: 156,
    pointsEarned: 60,
    volunteerHours: 8, // Higher than actual 6 hours due to educational value and leadership
    status: 'completed',
    image: 'https://placehold.co/600x400/png?text=Community+Garden'
  }
];

// Create the store
interface EventsState {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'participantCount'>) => void;
  updateEvent: (id: string, eventData: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: initialEvents,
  
  addEvent: (eventData) => set(state => {
    const newId = String(state.events.length + 1);
    const newEvent: Event = {
      ...eventData as Event,
      id: newId,
      participantCount: 0,
    };
    return { events: [...state.events, newEvent] };
  }),
  
  updateEvent: (id, eventData) => set(state => ({
    events: state.events.map(event => 
      event.id === id ? { ...event, ...eventData } : event
    )
  })),
  
  deleteEvent: (id) => set(state => ({
    events: state.events.filter(event => event.id !== id)
  })),
  
  getEvent: (id) => get().events.find(event => event.id === id),
}));
