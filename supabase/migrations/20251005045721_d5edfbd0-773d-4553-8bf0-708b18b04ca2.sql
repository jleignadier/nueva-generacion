-- Secure donation-receipts storage bucket with proper RLS policies
-- These policies mirror the donations table policies for consistent security

-- Policy 1: Users can upload their own donation receipts
-- Files must be in their own user_id folder: user_id/filename.pdf
CREATE POLICY "Users can upload their own donation receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'donation-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view only their own donation receipts
CREATE POLICY "Users can view their own donation receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'donation-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Admins can view all donation receipts
CREATE POLICY "Admins can view all donation receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'donation-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 4: Admins can delete donation receipts (for moderation/cleanup)
CREATE POLICY "Admins can delete donation receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'donation-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 5: Admins can update donation receipts metadata
CREATE POLICY "Admins can update donation receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'donation-receipts' AND
  has_role(auth.uid(), 'admin'::app_role)
);