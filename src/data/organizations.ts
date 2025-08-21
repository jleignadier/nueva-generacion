export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  status: string;
  points: number;
  members: number;
  description: string;
}

export const organizations: Organization[] = [
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