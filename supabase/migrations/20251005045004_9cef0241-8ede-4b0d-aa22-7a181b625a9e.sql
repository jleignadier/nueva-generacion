-- PHASE 4 (FIRST): Drop existing organizations_public view to avoid conflict
DROP VIEW IF EXISTS organizations_public CASCADE;

-- PHASE 1: Secure Organization Contact Information
-- Create public organizations view (excluding sensitive contact data)
CREATE OR REPLACE VIEW organizations_public AS
SELECT 
  id,
  name,
  description,
  logo_url,
  created_at
FROM organizations;

GRANT SELECT ON organizations_public TO anon, authenticated;

-- Drop overly permissive organization policy
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;

-- Create restrictive policy for authenticated users
CREATE POLICY "Authenticated users can view basic org info" 
ON organizations FOR SELECT
TO authenticated
USING (true);

-- PHASE 2: Secure Role Management & Prevent Privilege Escalation
-- Create role change audit table
CREATE TABLE user_role_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now(),
  reason text
);

ALTER TABLE user_role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit" ON user_role_audit
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create secure role update function (prevents privilege escalation)
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id uuid,
  new_role app_role,
  reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role app_role;
  admin_user_id uuid;
BEGIN
  -- Get current user
  admin_user_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT has_role(admin_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  -- Prevent self-modification (CRITICAL SECURITY MEASURE)
  IF admin_user_id = target_user_id THEN
    RAISE EXCEPTION 'Admins cannot change their own role';
  END IF;
  
  -- Get current role
  SELECT role INTO old_role FROM user_roles WHERE user_id = target_user_id;
  
  -- Update role
  UPDATE user_roles 
  SET role = new_role 
  WHERE user_id = target_user_id;
  
  -- Log the change
  INSERT INTO user_role_audit (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, old_role, new_role, admin_user_id, reason);
END;
$$;

-- Drop the overly permissive signup policy that could enable privilege escalation
DROP POLICY IF EXISTS "System can insert roles on signup" ON user_roles;

-- PHASE 3: Restrict Public Event & Metrics Access
-- Create public events view (without creator IDs)
CREATE OR REPLACE VIEW events_public AS
SELECT 
  id,
  title,
  description,
  date,
  time,
  end_time,
  location,
  image_url,
  status,
  points_earned,
  volunteer_hours,
  funding_required,
  current_funding,
  created_at,
  updated_at
FROM events
WHERE status != 'cancelled'::event_status;

GRANT SELECT ON events_public TO anon, authenticated;

-- Update organization_points policy - require authentication
DROP POLICY IF EXISTS "Anyone can view organization points" ON organization_points;

CREATE POLICY "Authenticated users can view org points"
ON organization_points FOR SELECT
TO authenticated
USING (true);

-- Add trigger for updated_at on audit table
CREATE TRIGGER update_user_role_audit_updated_at
  BEFORE UPDATE ON user_role_audit
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();