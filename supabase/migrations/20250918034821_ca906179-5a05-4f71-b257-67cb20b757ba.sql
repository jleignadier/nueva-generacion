-- Create app_role enum for different user types
CREATE TYPE public.app_role AS ENUM ('volunteer', 'organization', 'admin');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  birthdate DATE,
  account_type app_role NOT NULL DEFAULT 'volunteer',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for organizations
CREATE POLICY "Organizations are viewable by everyone" 
ON public.organizations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage organizations" 
ON public.organizations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Organizations can update themselves" 
ON public.organizations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id = organizations.id 
    AND account_type = 'organization'
  )
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert roles on signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
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
    org_id
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_account_type);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();