import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

// Define event types
export interface EventDonation {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  donationType?: 'individual' | 'organization';
  organizationId?: string;
  receiptFile?: string;
  donationMethod?: 'qrcode' | 'yappy';
}

export interface RegisteredParticipant {
  id: string;
  name: string;
  type: 'user' | 'organization';
  avatar?: string;
}

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
  fundingRequired?: number; // Optional funding target
  currentFunding?: number; // Current amount raised
  donations?: EventDonation[]; // Donation history
  registeredParticipants?: RegisteredParticipant[]; // Registered users and organizations
}

// Initial events data
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Limpieza de Playa',
    location: 'Playa Santa Mónica',
    date: '2025-09-23',
    time: '09:00',
    endTime: '12:00',
    description: "¡Únete a nosotros para una limpieza comunitaria de playa! Estaremos removiendo basura y desechos de la orilla para proteger la vida marina y mantener nuestras playas hermosas.",
    participantCount: 24,
    pointsEarned: 50,
    volunteerHours: 4, // Higher than actual 3 hours due to physical effort
    status: 'upcoming',
    image: 'https://placehold.co/600x400/png?text=Beach+Cleanup',
    fundingRequired: 500,
    currentFunding: 320,
    donations: [
      { id: '1', userId: '1', userName: 'María García', amount: 50, status: 'approved', createdAt: '2025-09-15', donationType: 'individual', receiptFile: 'receipt1.jpg', donationMethod: 'yappy' },
      { id: '2', userId: '2', userName: 'Juan Pérez', amount: 100, status: 'approved', createdAt: '2025-09-16', donationType: 'individual', receiptFile: 'receipt2.jpg', donationMethod: 'qrcode' },
      { id: '3', userId: '3', userName: 'Ana López (Green Earth Foundation)', amount: 75, status: 'pending', createdAt: '2025-09-17', donationType: 'organization', organizationId: '1', receiptFile: 'receipt3.jpg', donationMethod: 'yappy' }
    ],
    registeredParticipants: [
      { id: '1', name: 'María García', type: 'user', avatar: 'https://placehold.co/40x40/png?text=MG' },
      { id: '2', name: 'Juan Pérez', type: 'user', avatar: 'https://placehold.co/40x40/png?text=JP' },
      { id: '3', name: 'Green Earth Foundation', type: 'organization', avatar: 'https://placehold.co/40x40/png?text=GE' },
      { id: '4', name: 'Ana López', type: 'user', avatar: 'https://placehold.co/40x40/png?text=AL' },
      { id: '5', name: 'Carlos Ruiz', type: 'user', avatar: 'https://placehold.co/40x40/png?text=CR' }
    ]
  },
  {
    id: '2',
    title: 'Recolección de Alimentos',
    location: 'Parque Central',
    date: '2025-09-24',
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
    date: '2025-09-26',
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
  loading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'participantCount'>) => void;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  addDonation: (eventId: string, donation: Omit<EventDonation, 'id'>) => void;
  approveDonation: (eventId: string, donationId: string) => void;
  rejectDonation: (eventId: string, donationId: string) => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,

  loadEvents: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedEvents: Event[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        time: event.time,
        endTime: event.end_time || undefined,
        description: event.description || '',
        participantCount: 0, // TODO: Could be calculated from event_attendance
        pointsEarned: event.points_earned || 0,
        volunteerHours: Number(event.volunteer_hours) || 0,
        status: event.status as 'upcoming' | 'completed',
        image: event.image_url || 'https://placehold.co/600x400/png?text=Event',
        fundingRequired: Number(event.funding_required) || undefined,
        currentFunding: Number(event.current_funding) || 0,
        donations: [], // TODO: Load from donations table if needed
        registeredParticipants: [] // TODO: Load from event_attendance if needed
      }));

      set({ events: formattedEvents, loading: false });
    } catch (error) {
      console.error('Error loading events:', error);
      set({ loading: false });
    }
  },
  
  addEvent: async (eventData) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          location: eventData.location,
          date: eventData.date,
          time: eventData.time,
          end_time: eventData.endTime,
          description: eventData.description,
          points_earned: eventData.pointsEarned,
          volunteer_hours: eventData.volunteerHours,
          status: eventData.status,
          image_url: eventData.image,
          funding_required: eventData.fundingRequired,
          current_funding: eventData.currentFunding || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Reload events to get the new one with proper UUID
      await get().loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },
  
  updateEvent: async (id, eventData) => {
    try {
      // Map Event fields to database columns
      const dbFields: any = {};
      if (eventData.title !== undefined) dbFields.title = eventData.title;
      if (eventData.location !== undefined) dbFields.location = eventData.location;
      if (eventData.date !== undefined) dbFields.date = eventData.date;
      if (eventData.time !== undefined) dbFields.time = eventData.time;
      if (eventData.endTime !== undefined) dbFields.end_time = eventData.endTime;
      if (eventData.description !== undefined) dbFields.description = eventData.description;
      if (eventData.pointsEarned !== undefined) dbFields.points_earned = eventData.pointsEarned;
      if (eventData.volunteerHours !== undefined) dbFields.volunteer_hours = eventData.volunteerHours;
      if (eventData.status !== undefined) dbFields.status = eventData.status;
      if (eventData.image !== undefined) dbFields.image_url = eventData.image;
      if (eventData.fundingRequired !== undefined) dbFields.funding_required = eventData.fundingRequired;
      if (eventData.currentFunding !== undefined) dbFields.current_funding = eventData.currentFunding;

      const { error } = await supabase
        .from('events')
        .update(dbFields)
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        throw error;
      }

      // Update local state after successful database update
      set(state => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        )
      }));
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },
  
  deleteEvent: async (id) => {
    try {
      console.log('🗑️ Attempting to delete event:', id);
      
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Database error deleting event:', error);
        throw error;
      }

      console.log('✅ Event deleted from database:', data);

      // Update local state after successful database deletion
      set(state => {
        const newEvents = state.events.filter(event => event.id !== id);
        console.log(`📊 Local state updated. Events before: ${state.events.length}, after: ${newEvents.length}`);
        return { events: newEvents };
      });
    } catch (error) {
      console.error('❌ Failed to delete event:', error);
      throw error;
    }
  },
  
  getEvent: (id) => get().events.find(event => event.id === id),
  
  addDonation: (eventId, donationData) => set(state => ({
    events: state.events.map(event => {
      if (event.id === eventId) {
        const newDonation: EventDonation = {
          ...donationData,
          id: Date.now().toString(),
        };
        const donations = event.donations || [];
        return {
          ...event,
          donations: [...donations, newDonation],
        };
      }
      return event;
    })
  })),
  
  approveDonation: (eventId, donationId) => set(state => ({
    events: state.events.map(event => {
      if (event.id === eventId && event.donations) {
        const updatedDonations = event.donations.map(donation => {
          if (donation.id === donationId) {
            return { ...donation, status: 'approved' as const };
          }
          return donation;
        });
        const approvedDonation = updatedDonations.find(d => d.id === donationId);
        const currentFunding = (event.currentFunding || 0) + (approvedDonation?.amount || 0);
        return {
          ...event,
          donations: updatedDonations,
          currentFunding,
        };
      }
      return event;
    })
  })),
  
  rejectDonation: (eventId, donationId) => set(state => ({
    events: state.events.map(event => {
      if (event.id === eventId && event.donations) {
        const updatedDonations = event.donations.map(donation => {
          if (donation.id === donationId) {
            return { ...donation, status: 'rejected' as const };
          }
          return donation;
        });
        return {
          ...event,
          donations: updatedDonations,
        };
      }
      return event;
    })
  })),
}));
