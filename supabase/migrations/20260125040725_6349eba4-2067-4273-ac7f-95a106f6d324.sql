-- Update the handle_new_user() function to automatically create user_points record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_account_type app_role;
  org_id UUID;
  org_name TEXT;
  join_org_id UUID;
BEGIN
  -- Get account type from metadata
  user_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'volunteer')::app_role;
  
  -- If organization type, create organization first
  IF user_account_type = 'organization' THEN
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    INSERT INTO public.organizations (name, contact_email)
    VALUES (org_name, NEW.email)
    RETURNING id INTO org_id;
  END IF;
  
  -- Check if joining existing organization
  IF NEW.raw_user_meta_data->>'join_organization_id' IS NOT NULL THEN
    join_org_id := (NEW.raw_user_meta_data->>'join_organization_id')::UUID;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    birthdate,
    account_type,
    organization_id
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birthdate' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birthdate')::DATE 
      ELSE NULL 
    END,
    user_account_type,
    COALESCE(org_id, join_org_id)
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_account_type);
  
  -- Create user_points record with 0 points (ensures all users appear in leaderboards)
  INSERT INTO public.user_points (user_id, points, total_hours, events_attended)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$$;

-- Backfill: Create user_points records for existing users who don't have one
INSERT INTO public.user_points (user_id, points, total_hours, events_attended)
SELECT p.id, 0, 0, 0
FROM public.profiles p
LEFT JOIN public.user_points up ON p.id = up.user_id
WHERE up.id IS NULL;