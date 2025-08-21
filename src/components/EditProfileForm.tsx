import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Building } from 'lucide-react';
import { organizations } from '@/data/organizations';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileForm = ({ isOpen, onClose }: EditProfileFormProps) => {
  const { user, login } = useAuth(); // Using login to update user data
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    accountType: user?.accountType || 'individual',
    organizationId: user?.organizationId || ''
  });

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
      // Create updated user object
      const updatedUser = {
        ...user!,
        name: formData.name,
        email: formData.email,
        accountType: formData.accountType as 'individual' | 'organization' | 'admin',
        organizationId: formData.accountType === 'organization' ? formData.organizationId : undefined
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update context (using login method to set user)
      await login(formData.email, 'password'); // Mock password since we're updating existing user
      
      toast({
        title: "Profile updated!",
        description: "Your profile information has been successfully updated.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="pl-10"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.accountType === 'organization' || formData.accountType === 'individual') && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">
                {formData.accountType === 'organization' ? 'Your Organization' : 'Join Organization (Optional)'}
              </Label>
              <Select 
                value={formData.organizationId} 
                onValueChange={(value) => handleInputChange('organizationId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    formData.accountType === 'organization' 
                      ? "Select your organization" 
                      : "Select organization to join"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {formData.accountType === 'individual' && (
                    <SelectItem value="">No organization</SelectItem>
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
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;