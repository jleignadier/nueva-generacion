import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';

type SortField = 'name' | 'contactEmail' | 'points' | 'members';
type SortDirection = 'asc' | 'desc';

interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  status: string;
  points: number;
  members: number;
  description: string;
}

interface EditOrganizationForm {
  name: string;
  contactEmail: string;
  description: string;
}

const AdminOrganizations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [organizations, setOrganizations] = useState<Organization[]>([
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
  ]);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleStatus = (organizationId: string) => {
    setOrganizations(organizations.map(org => 
      org.id === organizationId 
        ? { ...org, status: org.status === 'Active' ? 'Inactive' : 'Active' }
        : org
    ));
    toast({
      title: "Organization status updated",
      description: "The organization's status has been successfully changed.",
    });
  };

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrganization(organization);
    setIsEditDialogOpen(true);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditOrganizationForm>();

  const onSubmitEdit = (data: EditOrganizationForm) => {
    if (!editingOrganization) return;
    
    setOrganizations(organizations.map(org => 
      org.id === editingOrganization.id 
        ? { ...org, ...data }
        : org
    ));
    
    toast({
      title: "Organization updated successfully",
      description: "The organization's information has been updated.",
    });
    
    setIsEditDialogOpen(false);
    setEditingOrganization(null);
    reset();
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
  }, [organizations, searchTerm, sortField, sortDirection]);

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
      <h1 className="text-3xl font-bold text-white">Organizations Management</h1>
      
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-medium text-white">All Organizations</h2>
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-zinc-400 sm:w-64"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="name">Organization</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="contactEmail">Contact Email</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="points">Points</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="members">Members</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">Status</th>
                <th className="text-left py-3 px-4 text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredOrganizations.map((org, i) => (
                <tr key={i} className="border-b border-zinc-700 hover:bg-zinc-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-white">{org.name}</div>
                      <div className="text-sm text-zinc-400">{org.description}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">{org.contactEmail}</td>
                  <td className="py-3 px-4 font-bold text-purple-400">{org.points}</td>
                  <td className="py-3 px-4 text-white">{org.members}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      org.status === 'Active'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditOrganization(org)}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(org.id)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {org.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                defaultValue={editingOrganization?.name}
                {...register('name', { required: 'Organization name is required' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                defaultValue={editingOrganization?.contactEmail}
                {...register('contactEmail', { required: 'Contact email is required' })}
              />
              {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={editingOrganization?.description}
                {...register('description', { required: 'Description is required' })}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganizations;