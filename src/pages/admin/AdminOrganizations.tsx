import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { useOrganizationsStore, Organization } from '@/store/organizationsStore';
import { useOrganizationSecurity } from '@/hooks/useOrganizationSecurity';
import { filterOrganizationData } from '@/utils/organizationSecurity';

type SortField = 'name' | 'contactEmail' | 'points' | 'members';
type SortDirection = 'asc' | 'desc';

interface EditOrganizationForm {
  name: string;
  contactEmail: string;
  description: string;
}

const AdminOrganizations = () => {
  const { organizations, updateOrganization, toggleOrganizationStatus, initializeOrganizations, fetchOrganizations } = useOrganizationsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canViewContact, isAdmin, loading } = useOrganizationSecurity();

  // Fetch organizations from database on component mount
  React.useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleStatus = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);
    const newStatus = org?.status === 'Activo' ? 'Inactivo' : 'Activo';
    
    toggleOrganizationStatus(organizationId);
    
    toast({
      title: "Estado de organización actualizado",
      description: `Organización ${newStatus === 'Activo' ? 'habilitada' : 'deshabilitada'} exitosamente`,
    });
  };

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrganization(organization);
    setIsEditDialogOpen(true);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditOrganizationForm>();

  const onSubmitEdit = (data: EditOrganizationForm) => {
    if (editingOrganization) {
      updateOrganization(editingOrganization.id, data);
      
      toast({
        title: "Organización actualizada",
        description: "Los detalles de la organización fueron actualizados exitosamente",
      });
      
      setIsEditDialogOpen(false);
      setEditingOrganization(null);
    }
  };

  const sortedAndFilteredOrganizations = useMemo(() => {
    // Filter organization data based on user permissions
    const secureOrganizations = organizations.map(org => 
      filterOrganizationData(org, canViewContact)
    );

    let filtered = secureOrganizations.filter(org => {
      const nameMatch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = org.description.toLowerCase().includes(searchTerm.toLowerCase());
      // Only include contact email in search if user can view it
      const emailMatch = canViewContact && 'contactEmail' in org 
        ? org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      return nameMatch || descMatch || emailMatch;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortField as keyof typeof a] || '';
      let bValue: string | number = b[sortField as keyof typeof b] || '';

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
  }, [organizations, searchTerm, sortField, sortDirection, canViewContact]);

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
      <h1 className="text-3xl font-bold text-white">Administración de Organizaciones</h1>
      
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-medium text-white">Todas las Organizaciones</h2>
          <input
            type="text"
            placeholder="Buscar organizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-zinc-400 sm:w-64"
          />
        </div>

        <div className="min-h-[600px] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="name">Organización</SortButton>
                </th>
                {canViewContact && (
                  <th className="text-left py-3 px-4 text-zinc-300">
                    <SortButton field="contactEmail">Correo de Contacto</SortButton>
                  </th>
                )}
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="points">Puntos</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="members">Miembros</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">Estado</th>
                {isAdmin && (
                  <th className="text-left py-3 px-4 text-zinc-300">Acciones</th>
                )}
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
                  {canViewContact && (
                    <td className="py-3 px-4 text-zinc-400">
                      {'contactEmail' in org ? org.contactEmail : 'N/A'}
                    </td>
                  )}
                  <td className="py-3 px-4 font-bold text-purple-400">{org.points}</td>
                  <td className="py-3 px-4 text-white">{org.members}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      org.status === 'Activo'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {org.status === 'Activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditOrganization(organizations.find(o => o.id === org.id)!)}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(org.id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          {org.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      </div>
                    </td>
                  )}
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
            <DialogTitle>Editar Organización</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la Organización</Label>
              <Input
                id="name"
                defaultValue={editingOrganization?.name}
                {...register('name', { required: 'El nombre de la organización es requerido' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Correo de Contacto</Label>
              <Input
                id="contactEmail"
                type="email"
                defaultValue={editingOrganization?.contactEmail}
                {...register('contactEmail', { required: 'El correo de contacto es requerido' })}
              />
              {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                defaultValue={editingOrganization?.description}
                {...register('description', { required: 'La descripción es requerida' })}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganizations;