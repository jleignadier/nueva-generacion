-- Add new document type for combined terms and privacy
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'terms_and_privacy';