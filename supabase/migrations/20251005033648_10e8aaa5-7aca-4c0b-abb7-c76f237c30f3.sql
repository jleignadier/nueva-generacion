-- Create donation status enum
CREATE TYPE donation_status AS ENUM ('pending', 'approved', 'rejected');

-- Create donation type enum
CREATE TYPE donation_type AS ENUM ('individual', 'organization');

-- Create donation method enum
CREATE TYPE donation_method AS ENUM ('qrcode', 'yappy');

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  receipt_url TEXT NOT NULL,
  receipt_path TEXT NOT NULL,
  status donation_status NOT NULL DEFAULT 'pending',
  donation_type donation_type NOT NULL DEFAULT 'individual',
  donation_method donation_method NOT NULL DEFAULT 'yappy',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own donations
CREATE POLICY "Users can insert their own donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own donations
CREATE POLICY "Users can view their own donations"
  ON public.donations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
  ON public.donations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all donations
CREATE POLICY "Admins can update all donations"
  ON public.donations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_event_id ON public.donations(event_id);
CREATE INDEX idx_donations_status ON public.donations(status);

-- Enable realtime
ALTER TABLE public.donations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;