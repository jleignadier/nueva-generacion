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
  endDate?: string;
  time: string;
  endTime?: string;
  description: string;
  participantCount: number;
  pointsEarned: number;
  volunteerHours: number;
  status: 'upcoming' | 'completed';
  image: string;
  fundingRequired?: number;
  currentFunding?: number;
  donations?: EventDonation[];
  registeredParticipants?: RegisteredParticipant[];
  recurrenceType?: string | null;
  recurrenceEndDate?: string | null;
  recurrenceGroupId?: string | null;
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
  addRecurringEvents: (baseEvent: Omit<Event, 'id' | 'participantCount'>, recurrenceType: string, recurrenceEndDate: string) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  updateRecurringSeries: (recurrenceGroupId: string, currentEventId: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteRecurringSeries: (recurrenceGroupId: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  getSeriesEvents: (recurrenceGroupId: string) => Event[];
  addDonation: (eventId: string, donation: Omit<EventDonation, 'id'>) => void;
  approveDonation: (eventId: string, donationId: string) => void;
  rejectDonation: (eventId: string, donationId: string) => void;
  registerForEvent: (eventId: string, userId: string, organizationId?: string) => Promise<void>;
  registerForSeries: (recurrenceGroupId: string, userId: string, organizationId?: string) => Promise<void>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<void>;
  isUserRegistered: (eventId: string, userId: string) => Promise<boolean>;
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

      // Fetch participants for each event using secure RPC function
      const registrationsByEvent: Record<string, RegisteredParticipant[]> = {};
      const eventIds = (data || []).map(e => e.id);
      
      await Promise.all(eventIds.map(async (eventId) => {
        const { data: participants } = await supabase
          .rpc('get_event_participants', { p_event_id: eventId });
        
        if (participants) {
          registrationsByEvent[eventId] = participants.map((p: any) => ({
            id: p.user_id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            type: p.account_type === 'organization' ? 'organization' as const : 'user' as const,
            avatar: p.avatar_url || undefined
          }));
        }
      }));

      // Fetch attendance counts for completed events
      const { data: attendanceData } = await supabase
        .from('event_attendance')
        .select('event_id');

      // Count attendance per event
      const attendanceCounts: Record<string, number> = {};
      if (attendanceData) {
        attendanceData.forEach(record => {
          attendanceCounts[record.event_id] = (attendanceCounts[record.event_id] || 0) + 1;
        });
      }

      const formattedEvents: Event[] = (data || []).map(event => {
        const registeredParticipants = registrationsByEvent[event.id] || [];
        const isCompleted = event.status === 'completed';
        
          return {
          id: event.id,
          title: event.title,
          location: event.location,
          date: event.date,
          endDate: event.end_date || undefined,
          time: event.time,
          endTime: event.end_time || undefined,
          description: event.description || '',
          participantCount: isCompleted ? (attendanceCounts[event.id] || 0) : registeredParticipants.length,
          pointsEarned: event.points_earned || 0,
          volunteerHours: Number(event.volunteer_hours) || 0,
          status: event.status as 'upcoming' | 'completed',
          image: event.image_url || 'https://placehold.co/600x400/png?text=Event',
          fundingRequired: Number(event.funding_required) || undefined,
          currentFunding: Number(event.current_funding) || 0,
          donations: [],
          registeredParticipants,
          recurrenceType: (event as any).recurrence_type || null,
          recurrenceEndDate: (event as any).recurrence_end_date || null,
          recurrenceGroupId: (event as any).recurrence_group_id || null,
        };
      });

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
          end_date: eventData.endDate || null,
          time: eventData.time,
          end_time: eventData.endTime,
          description: eventData.description,
          points_earned: eventData.pointsEarned,
          volunteer_hours: eventData.volunteerHours,
          status: eventData.status,
          image_url: eventData.image,
          funding_required: eventData.fundingRequired,
          current_funding: eventData.currentFunding || 0,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await get().loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  addRecurringEvents: async (baseEvent, recurrenceType, recurrenceEndDate) => {
    try {
      const { addWeeks, addMonths, parseISO, format: fnsFormat, isBefore, isEqual } = await import('date-fns');
      
      const groupId = crypto.randomUUID();
      const startDate = parseISO(baseEvent.date);
      const endDate = parseISO(recurrenceEndDate);
      
      const dates: Date[] = [startDate];
      let current = startDate;
      
      while (true) {
        let next: Date;
        if (recurrenceType === 'weekly') next = addWeeks(current, 1);
        else if (recurrenceType === 'biweekly') next = addWeeks(current, 2);
        else next = addMonths(current, 1);
        
        if (isBefore(next, endDate) || isEqual(next, endDate)) {
          dates.push(next);
          current = next;
        } else {
          break;
        }
      }
      
      const rows = dates.map(d => ({
        title: baseEvent.title,
        location: baseEvent.location,
        date: fnsFormat(d, 'yyyy-MM-dd'),
        end_date: baseEvent.endDate || null,
        time: baseEvent.time,
        end_time: baseEvent.endTime || null,
        description: baseEvent.description,
        points_earned: baseEvent.pointsEarned,
        volunteer_hours: baseEvent.volunteerHours,
        status: baseEvent.status,
        image_url: baseEvent.image,
        funding_required: baseEvent.fundingRequired || 0,
        current_funding: 0,
        recurrence_type: recurrenceType,
        recurrence_end_date: recurrenceEndDate,
        recurrence_group_id: groupId,
      }));
      
      const { error } = await supabase.from('events').insert(rows as any);
      if (error) throw error;
      
      await get().loadEvents();
    } catch (error) {
      console.error('Error adding recurring events:', error);
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
      if (eventData.endDate !== undefined) dbFields.end_date = eventData.endDate || null;
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

  registerForEvent: async (eventId: string, userId: string, organizationId?: string) => {
    try {
      console.log('📝 Registering for event:', { eventId, userId, organizationId });
      
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          organization_id: organizationId || null
        })
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Registration data:', data);

      // Reload events to update registration counts
      await get().loadEvents();
    } catch (error) {
      console.error('❌ Error registering for event:', error);
      throw error;
    }
  },

  unregisterFromEvent: async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Reload events to update registration counts
      await get().loadEvents();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      throw error;
    }
  },

  isUserRegistered: async (eventId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  },
}));
