import { Organization } from '@/store/organizationsStore';

export interface PublicOrganization {
  id: string;
  name: string;
  description: string;
  points: number;
  members: number;
  status: 'Activo' | 'Inactivo';
  created_at?: string;
}

export interface FullOrganization extends PublicOrganization {
  contactEmail: string;
}

/**
 * Filters organization data to remove sensitive contact information
 * for users who don't have permission to view it
 */
export const filterOrganizationData = (
  organization: Organization,
  canViewContact: boolean
): PublicOrganization | FullOrganization => {
  if (canViewContact) {
    return organization as FullOrganization;
  }

  // Return only public data
  const { contactEmail, ...publicData } = organization;
  return publicData as PublicOrganization;
};

/**
 * Filters an array of organizations based on user permissions
 */
export const filterOrganizationsData = (
  organizations: Organization[],
  canViewContact: boolean
): (PublicOrganization | FullOrganization)[] => {
  return organizations.map(org => filterOrganizationData(org, canViewContact));
};

/**
 * Checks if the provided organization data includes contact information
 */
export const hasContactInformation = (
  organization: PublicOrganization | FullOrganization
): organization is FullOrganization => {
  return 'contactEmail' in organization;
};