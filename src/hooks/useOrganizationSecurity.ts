import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrganizationSecurity = (organizationId?: string) => {
  const { user } = useAuth();
  const [canViewContact, setCanViewContact] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanViewContact(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });
        
        setIsAdmin(!!adminCheck);

        // If checking for specific organization, verify contact access
        if (organizationId) {
          const { data: contactCheck } = await supabase
            .rpc('can_view_organization_contact', { 
              org_id: organizationId 
            });
          
          setCanViewContact(!!contactCheck);
        } else {
          // For general admin access
          setCanViewContact(!!adminCheck);
        }
      } catch (error) {
        console.error('Error checking organization permissions:', error);
        setCanViewContact(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user, organizationId]);

  return {
    canViewContact,
    isAdmin,
    loading
  };
};