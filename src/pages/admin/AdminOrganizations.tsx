import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SortField = 'name' | 'contactEmail' | 'points' | 'members';
type SortDirection = 'asc' | 'desc';

interface Organization {
  name: string;
  contactEmail: string;
  status: string;
  points: number;
  members: number;
  description: string;
}

const AdminOrganizations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const organizations: Organization[] = [
    { 
      name: 'Green Future Foundation', 
      contactEmail: 'contact@greenfuture.org', 
      status: 'Active', 
      points: 1250, 
      members: 45,
      description: 'Environmental conservation organization'
    },
    { 
      name: 'Community Health Initiative', 
      contactEmail: 'info@healthinit.org', 
      status: 'Active', 
      points: 892, 
      members: 32,
      description: 'Promoting community health and wellness'
    },
    { 
      name: 'Education for All', 
      contactEmail: 'admin@eduforall.org', 
      status: 'Active', 
      points: 2103, 
      members: 78,
      description: 'Providing educational resources to underserved communities'
    },
    { 
      name: 'Animal Rescue Network', 
      contactEmail: 'rescue@animalnet.org', 
      status: 'Inactive', 
      points: 567, 
      members: 23,
      description: 'Animal welfare and rescue operations'
    },
    { 
      name: 'Youth Development Center', 
      contactEmail: 'youth@devcenter.org', 
      status: 'Active', 
      points: 1456, 
      members: 56,
      description: 'Supporting youth development programs'
    },
  ];

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredOrganizations = useMemo(() => {
    let filtered = organizations.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [searchTerm, sortField, sortDirection]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-purple-400 transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizations Management</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>All Organizations</CardTitle>
            <Input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {sortedAndFilteredOrganizations.map((org, i) => (
              <Card key={i} className="border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{org.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{org.contactEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">{org.description}</p>
                    </div>
                    <span className="text-lg font-bold text-purple-400 ml-2">{org.points} pts</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        org.status === 'Active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {org.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {org.members} members
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      {org.status === 'Active' ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">
                    <SortButton field="name">Organization</SortButton>
                  </th>
                  <th className="text-left py-3 px-4">
                    <SortButton field="contactEmail">Contact Email</SortButton>
                  </th>
                  <th className="text-left py-3 px-4">
                    <SortButton field="points">Points</SortButton>
                  </th>
                  <th className="text-left py-3 px-4">
                    <SortButton field="members">Members</SortButton>
                  </th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredOrganizations.map((org, i) => (
                  <tr key={i} className="border-b border-zinc-700">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">{org.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{org.contactEmail}</td>
                    <td className="py-3 px-4 font-bold text-purple-400">{org.points}</td>
                    <td className="py-3 px-4">{org.members}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        org.status === 'Active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-400 text-sm">
                        {org.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrganizations;