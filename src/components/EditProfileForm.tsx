import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const { organizations, initializeOrganizations } = useOrganizationsStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    accountType: user?.accountType || 'individual',
    organizationId: user?.organizationId || 'none'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize organizations on component mount
  React.useEffect(() => {
    initializeOrganizations();
  }, [initializeOrganizations]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user in context
      const updatedUser = {
        ...user!,
        name: formData.name,
        email: formData.email,
        accountType: formData.accountType as 'individual' | 'organization' | 'admin',
        organizationId: formData.accountType === 'organization' ? formData.organizationId : (formData.organizationId === 'none' ? undefined : formData.organizationId)
      };

      // Update localStorage
      localStorage.setItem('nuevaGen_user', JSON.stringify(updatedUser));
      
      // Update context (using login method to set user)
      await login(formData.email, 'password'); // Mock password since we're updating existing user
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Actualización fallida",
        description: "Hubo un error al actualizar tu perfil. Por favor intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="accountType">Tipo de Cuenta</Label>
            <Select 
              value={formData.accountType} 
              onValueChange={(value) => handleInputChange('accountType', value)}
            >
              <SelectTrigger id="accountType">
                <SelectValue placeholder="Seleccionar tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="organization">Organización</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="organizationId">Organización</Label>
            <Select 
              value={formData.organizationId} 
              onValueChange={(value) => handleInputChange('organizationId', value)}
            >
              <SelectTrigger id="organizationId">
                <SelectValue placeholder="Seleccionar organización" />
              </SelectTrigger>
              <SelectContent>
                {formData.accountType === 'individual' && (
                  <SelectItem value="none">Sin organización</SelectItem>
                )}
                {organizations
                  .filter(org => org.status === 'Active')
                  .map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;