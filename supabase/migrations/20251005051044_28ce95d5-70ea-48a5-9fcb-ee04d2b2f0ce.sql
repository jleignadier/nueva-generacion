-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Add missing columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN status TEXT DEFAULT 'Activo' NOT NULL,
ADD COLUMN points INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN members INTEGER DEFAULT 0 NOT NULL;

-- Update handle_new_user trigger to copy email to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_account_type app_role;
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Get account type from metadata
  user_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'volunteer')::app_role;
  
  -- If organization type, create organization first
  IF user_account_type = 'organization' THEN
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    INSERT INTO public.organizations (name, contact_email, status, points, members)
    VALUES (org_name, NEW.email, 'Activo', 0, 1)
    RETURNING id INTO org_id;
  END IF;
  
  -- Create profile with email
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    birthdate,
    account_type,
    organization_id,
    email
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
    org_id,
    NEW.email
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_account_type);
  
  RETURN NEW;
END;
$function$;

-- Add RLS policy for admins to view all profile emails
CREATE POLICY "Admins can view all profile emails"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Backfill email for existing users from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;