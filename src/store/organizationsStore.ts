import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  status: 'Active' | 'Inactive';
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
}

// Initial organizations data
const initialOrganizations: Organization[] = [
  { 
    id: '1',
    name: 'Green Future Foundation', 
    contactEmail: 'contact@greenfuture.org', 
    status: 'Active', 
    points: 1250, 
    members: 45,
    description: 'Environmental conservation organization'
  },
  { 
    id: '2',
    name: 'Community Health Initiative', 
    contactEmail: 'info@healthinit.org', 
    status: 'Active', 
    points: 892, 
    members: 32,
    description: 'Promoting community health and wellness'
  },
  { 
    id: '3',
    name: 'Education for All', 
    contactEmail: 'admin@eduforall.org', 
    status: 'Active', 
    points: 2103, 
    members: 78,
    description: 'Providing educational resources to underserved communities'
  },
  { 
    id: '4',
    name: 'Animal Rescue Network', 
    contactEmail: 'rescue@animalnet.org', 
    status: 'Inactive', 
    points: 567, 
    members: 23,
    description: 'Animal welfare and rescue operations'
  },
  { 
    id: '5',
    name: 'Youth Development Center', 
    contactEmail: 'youth@devcenter.org', 
    status: 'Active', 
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
          status: 'Active',
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
              ? { ...org, status: org.status === 'Active' ? 'Inactive' : 'Active' }
              : org
          )
        }));
      },
      
      getActiveOrganizations: () => {
        return get().organizations.filter(org => org.status === 'Active');
      }
    }),
    {
      name: 'nuevagen-organizations-store',
      partialize: (state) => ({ organizations: state.organizations })
    }
  )
);