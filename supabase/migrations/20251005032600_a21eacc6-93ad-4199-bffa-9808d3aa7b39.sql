-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('terms_of_service', 'privacy_policy', 'volunteering_rules');

-- Create enum for check-in methods
CREATE TYPE public.check_in_method AS ENUM ('qr_scan', 'manual');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('upcoming', 'completed', 'cancelled');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-photos', 'event-photos', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('organization-logos', 'organization-logos', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('user-avatars', 'user-avatars', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('donation-receipts', 'donation-receipts', false, 8388608, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('legal-documents', 'legal-documents', true, 8388608, ARRAY['application/pdf']);

-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add logo_url to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_time TIME,
  description TEXT,
  image_url TEXT,
  points_earned INTEGER DEFAULT 0,
  volunteer_hours NUMERIC(5,2) DEFAULT 0,
  status public.event_status DEFAULT 'upcoming',
  funding_required NUMERIC(10,2) DEFAULT 0,
  current_funding NUMERIC(10,2) DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_points table
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_points table
CREATE TABLE public.organization_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_attendance table
CREATE TABLE public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_awarded INTEGER DEFAULT 0,
  hours_credited NUMERIC(5,2) DEFAULT 0,
  check_in_method public.check_in_method DEFAULT 'manual',
  UNIQUE(event_id, user_id)
);

-- Create legal_documents table
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type public.document_type NOT NULL,
  file_url TEXT NOT NULL,
  version INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id),
  is_current BOOLEAN DEFAULT true,
  UNIQUE(document_type, version)
);

-- Create user_legal_acceptance table
CREATE TABLE public.user_legal_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type public.document_type NOT NULL,
  version_accepted INTEGER NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, document_type, version_accepted)
);

-- Enable RLS on all new tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_legal_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_points table
CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all points" ON public.user_points FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for organization_points table
CREATE POLICY "Anyone can view organization points" ON public.organization_points FOR SELECT USING (true);
CREATE POLICY "Admins can manage organization points" ON public.organization_points FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for event_attendance table
CREATE POLICY "Users can view their own attendance" ON public.event_attendance FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage attendance" ON public.event_attendance FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for legal_documents table
CREATE POLICY "Anyone can view current legal documents" ON public.legal_documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage legal documents" ON public.legal_documents FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_legal_acceptance table
CREATE POLICY "Users can view their own acceptances" ON public.user_legal_acceptance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own acceptances" ON public.user_legal_acceptance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all acceptances" ON public.user_legal_acceptance FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Storage RLS Policies for event-photos bucket
CREATE POLICY "Admins can upload event photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can update event photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can delete event photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Anyone can view event photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'event-photos'
);

-- Storage RLS Policies for organization-logos bucket
CREATE POLICY "Organization members can upload their logo" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'organization-logos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id::text = (storage.foldername(name))[1]
    AND account_type = 'organization'
  )
);
CREATE POLICY "Organization members can update their logo" ON storage.objects FOR UPDATE USING (
  bucket_id = 'organization-logos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id::text = (storage.foldername(name))[1]
    AND account_type = 'organization'
  )
);
CREATE POLICY "Anyone can view organization logos" ON storage.objects FOR SELECT USING (
  bucket_id = 'organization-logos'
);

-- Storage RLS Policies for user-avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (
  bucket_id = 'user-avatars'
);

-- Storage RLS Policies for donation-receipts bucket
CREATE POLICY "Users can upload their own receipts" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'donation-receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view their own receipts" ON storage.objects FOR SELECT USING (
  bucket_id = 'donation-receipts' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR 
    has_role(auth.uid(), 'admin')
  )
);
CREATE POLICY "Admins can view all receipts" ON storage.objects FOR SELECT USING (
  bucket_id = 'donation-receipts' AND has_role(auth.uid(), 'admin')
);

-- Storage RLS Policies for legal-documents bucket
CREATE POLICY "Admins can upload legal documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'legal-documents' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can update legal documents" ON storage.objects FOR UPDATE USING (
  bucket_id = 'legal-documents' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can delete legal documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'legal-documents' AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Anyone can view legal documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'legal-documents'
);

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for user_points updated_at
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for organization_points updated_at
CREATE TRIGGER update_organization_points_updated_at
  BEFORE UPDATE ON public.organization_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award event points
CREATE OR REPLACE FUNCTION public.award_event_points(
  p_user_id UUID,
  p_event_id UUID,
  p_check_in_method public.check_in_method
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points INTEGER;
  v_hours NUMERIC(5,2);
  v_org_id UUID;
BEGIN
  -- Get event points and hours
  SELECT points_earned, volunteer_hours INTO v_points, v_hours
  FROM public.events
  WHERE id = p_event_id;

  -- Insert attendance record
  INSERT INTO public.event_attendance (
    event_id, user_id, points_awarded, hours_credited, check_in_method
  ) VALUES (
    p_event_id, p_user_id, v_points, v_hours, p_check_in_method
  )
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- Update or insert user_points
  INSERT INTO public.user_points (user_id, points, total_hours, events_attended)
  VALUES (p_user_id, v_points, v_hours, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    points = user_points.points + v_points,
    total_hours = user_points.total_hours + v_hours,
    events_attended = user_points.events_attended + 1,
    updated_at = now();

  -- Update organization points if user belongs to an organization
  SELECT organization_id INTO v_org_id
  FROM public.profiles
  WHERE id = p_user_id AND organization_id IS NOT NULL;

  IF v_org_id IS NOT NULL THEN
    INSERT INTO public.organization_points (organization_id, points)
    VALUES (v_org_id, v_points)
    ON CONFLICT (organization_id) DO UPDATE SET
      points = organization_points.points + v_points,
      updated_at = now();
  END IF;
END;
$$;

-- Function to get user leaderboard
CREATE OR REPLACE FUNCTION public.get_user_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  organization_name TEXT,
  points INTEGER,
  total_hours NUMERIC,
  events_attended INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    o.name AS organization_name,
    up.points,
    up.total_hours,
    up.events_attended,
    RANK() OVER (ORDER BY up.points DESC, up.events_attended DESC) AS rank
  FROM public.user_points up
  JOIN public.profiles p ON up.user_id = p.id
  LEFT JOIN public.organizations o ON p.organization_id = o.id
  ORDER BY up.points DESC, up.events_attended DESC
  LIMIT p_limit;
$$;

-- Function to get organization leaderboard
CREATE OR REPLACE FUNCTION public.get_organization_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  organization_id UUID,
  name TEXT,
  logo_url TEXT,
  points INTEGER,
  total_members INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    op.organization_id,
    o.name,
    o.logo_url,
    op.points,
    op.total_members,
    RANK() OVER (ORDER BY op.points DESC) AS rank
  FROM public.organization_points op
  JOIN public.organizations o ON op.organization_id = o.id
  ORDER BY op.points DESC
  LIMIT p_limit;
$$;

-- Function to check if user has accepted all current legal documents
CREATE OR REPLACE FUNCTION public.has_accepted_legal_docs(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.legal_documents ld
    WHERE ld.is_current = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_legal_acceptance ula
      WHERE ula.user_id = p_user_id
      AND ula.document_type = ld.document_type
      AND ula.version_accepted = ld.version
    )
  );
$$;

-- Enable realtime for leaderboard tables
ALTER TABLE public.user_points REPLICA IDENTITY FULL;
ALTER TABLE public.organization_points REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organization_points;