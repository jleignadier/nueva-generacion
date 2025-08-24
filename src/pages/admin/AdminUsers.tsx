
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';

type SortField = 'name' | 'email' | 'points' | 'role';
type SortDirection = 'asc' | 'desc';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  points: number;
  phone?: string;
  birthdate?: string;
}

interface EditUserForm {
  name: string;
  email: string;
  role: string;
  phone: string;
  birthdate: string;
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Usuario', status: 'Activo', points: 125, phone: '+1234567890', birthdate: '1990-05-15' },
    { id: '2', name: 'Maria Garcia', email: 'maria@example.com', role: 'Usuario', status: 'Activo', points: 89, phone: '+1234567891', birthdate: '1985-10-22' },
    { id: '3', name: 'Admin User', email: 'admin@ng.org.pa', role: 'Admin', status: 'Activo', points: 0, phone: '+1234567892' },
    { id: '4', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Usuario', status: 'Activo', points: 203, phone: '+1234567893', birthdate: '1992-03-08' },
    { id: '5', name: 'Carlos Rodriguez', email: 'carlos@example.com', role: 'Usuario', status: 'Inactivo', points: 67, phone: '+1234567894', birthdate: '1988-12-01' },
  ]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : user
    ));
    toast({
      title: "Estado del usuario actualizado",
      description: "El estado del usuario ha sido cambiado exitosamente.",
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditUserForm>();

  const onSubmitEdit = (data: EditUserForm) => {
    if (!editingUser) return;
    
    setUsers(users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...data }
        : user
    ));
    
    toast({
      title: "Usuario actualizado exitosamente",
      description: "La información del usuario ha sido actualizada.",
    });
    
    setIsEditDialogOpen(false);
    setEditingUser(null);
    reset();
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [users, searchTerm, sortField, sortDirection]);

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
      <h1 className="text-3xl font-bold text-white">Administración de Usuarios</h1>
      
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-medium text-white">Todos los Usuarios</h2>
          <input
            type="text"
            placeholder="Buscar usuarios..."
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
                  <SortButton field="name">Nombre</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="email">Correo</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="role">Rol</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">
                  <SortButton field="points">Puntos</SortButton>
                </th>
                <th className="text-left py-3 px-4 text-zinc-300">Estado</th>
                <th className="text-left py-3 px-4 text-zinc-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredUsers.map((user, i) => (
                <tr key={i} className="border-b border-zinc-700 hover:bg-zinc-700/50">
                  <td className="py-3 px-4 font-medium text-white">{user.name}</td>
                  <td className="py-3 px-4 text-zinc-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'Admin' 
                        ? 'bg-purple-900/30 text-purple-400'
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-purple-400">{user.points}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'Activo'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {user.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
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
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                defaultValue={editingUser?.name}
                {...register('name', { required: 'El nombre es requerido' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                defaultValue={editingUser?.email}
                {...register('email', { required: 'El correo electrónico es requerido' })}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select defaultValue={editingUser?.role} onValueChange={(value) => register('role').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Usuario">Usuario</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                defaultValue={editingUser?.phone}
                {...register('phone')}
              />
            </div>
            
            <div>
              <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
              <Input
                id="birthdate"
                type="date"
                defaultValue={editingUser?.birthdate}
                {...register('birthdate')}
              />
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

export default AdminUsers;
