import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  status: 'Activo' | 'Inactivo';
  points: number;
  members: number;
  description: string;
}

interface OrganizationsState {
  organizations: Organization[];
  addOrganization: (organization: Omit<Organization, 'id'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  toggleOrganizationStatus: (id: string) => void;
  getActiveOrganizations: () => Organization[];
  initializeOrganizations: () => void;
  fetchOrganizations: () => Promise<void>;
  syncWithDatabase: () => Promise<void>;
}

// Initial organizations data
const initialOrganizations: Organization[] = [
  { 
    id: '1',
    name: 'Green Future Foundation', 
    contactEmail: 'contact@greenfuture.org', 
    status: 'Activo',
    points: 1250, 
    members: 45,
    description: 'Environmental conservation organization'
  },
  { 
    id: '2',
    name: 'Community Health Initiative', 
    contactEmail: 'info@healthinit.org', 
    status: 'Activo',
    points: 892, 
    members: 32,
    description: 'Promoting community health and wellness'
  },
  { 
    id: '3',
    name: 'Education for All', 
    contactEmail: 'admin@eduforall.org', 
    status: 'Activo',
    points: 2103, 
    members: 78,
    description: 'Providing educational resources to underserved communities'
  },
  { 
    id: '4',
    name: 'Animal Rescue Network', 
    contactEmail: 'rescue@animalnet.org', 
    status: 'Inactivo', 
    points: 567, 
    members: 23,
    description: 'Animal welfare and rescue operations'
  },
  { 
    id: '5',
    name: 'Youth Development Center', 
    contactEmail: 'youth@devcenter.org', 
    status: 'Activo',
    points: 1456, 
    members: 56,
    description: 'Supporting youth development programs'
  },
];

export const useOrganizationsStore = create<OrganizationsState>()(
  persist(
    (set, get) => ({
      organizations: [],
      
      initializeOrganizations: () => {
        const state = get();
        if (state.organizations.length === 0) {
          set({ organizations: initialOrganizations });
        }
      },
      
      addOrganization: (orgData) => {
        const newOrg: Organization = {
          ...orgData,
          id: `org-${Date.now()}`,
          status: 'Activo',
          points: 0,
          members: 1
        };
        
        set((state) => ({
          organizations: [...state.organizations, newOrg]
        }));
      },
      
      updateOrganization: (id, updates) => {
        set((state) => ({
          organizations: state.organizations.map(org =>
            org.id === id ? { ...org, ...updates } : org
          )
        }));
      },
      
      toggleOrganizationStatus: (id) => {
        set((state) => ({
          organizations: state.organizations.map(org =>
            org.id === id 
              ? { ...org, status: org.status === 'Activo' ? 'Inactivo' : 'Activo' }
              : org
          )
        }));
      },
      
      getActiveOrganizations: () => {
        return get().organizations.filter(org => org.status === 'Activo');
      },

      fetchOrganizations: async () => {
        try {
          const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('name');

          if (error) {
            console.error('Error fetching organizations:', error);
            // Fallback to seed data on error
            get().initializeOrganizations();
            return;
          }

          // If database is empty, use seed data as fallback
          if (!data || data.length === 0) {
            get().initializeOrganizations();
            return;
          }

          // Convert database format to store format
          const formattedOrgs: Organization[] = data.map(org => ({
            id: org.id,
            name: org.name || '',
            contactEmail: org.contact_email || '',
            status: (org.status || 'Activo') as 'Activo' | 'Inactivo',
            points: org.points || 0,
            members: org.members || 0,
            description: org.description || ''
          }));

          set({ organizations: formattedOrgs });
        } catch (error) {
          console.error('Error in fetchOrganizations:', error);
          // Fallback to seed data on error
          get().initializeOrganizations();
        }
      },

      syncWithDatabase: async () => {
        // For now, we'll keep using the local store data
        // This method can be enhanced later to sync changes back to database
        const state = get();
        console.log('Organizations ready for database sync:', state.organizations.length);
      }
    }),
    {
      name: 'nuevagen-organizations-store',
      partialize: (state) => ({ organizations: state.organizations })
    }
  )
);