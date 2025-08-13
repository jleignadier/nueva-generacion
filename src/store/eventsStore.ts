
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
    title: 'Beach Cleanup',
    location: 'Santa Monica Beach',
    date: '2025-05-20',
    time: '09:00',
    endTime: '12:00',
    description: "Join us for a community beach cleanup! We will be removing trash and debris from the shoreline to protect marine life and keep our beaches beautiful.",
    participantCount: 24,
    pointsEarned: 50,
    volunteerHours: 4, // Higher than actual 3 hours due to physical effort
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Beach+Cleanup'
  },
  {
    id: '2',
    title: 'Food Drive',
    location: 'Central Park',
    date: '2025-05-25',
    time: '10:00',
    endTime: '14:00',
    description: 'Help us collect food donations for local food banks. Bring non-perishable items to support families in need in our community.',
    participantCount: 18,
    pointsEarned: 40,
    volunteerHours: 5, // Higher than actual 4 hours due to organization required
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Food+Drive'
  },
  {
    id: '3',
    title: 'Tutoring Session',
    location: 'Public Library',
    date: '2025-05-27',
    time: '16:00',
    endTime: '18:00',
    description: 'Volunteer to tutor students in math, science, and reading. Help young students improve their academic skills and confidence.',
    participantCount: 12,
    pointsEarned: 30,
    volunteerHours: 3, // Higher than actual 2 hours due to preparation and expertise required
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Tutoring+Session'
  },
  {
    id: '4',
    title: 'Earth Day Festival',
    location: 'Downtown Square',
    date: '2025-04-22',
    time: '12:00',
    endTime: '18:00',
    description: 'Help plant and maintain our community garden. Learn about sustainable gardening practices while beautifying our neighborhood.',
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
