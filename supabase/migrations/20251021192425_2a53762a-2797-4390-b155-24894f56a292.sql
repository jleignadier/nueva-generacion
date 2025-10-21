-- Insert legal documents with public URLs
-- Note: These are placeholder HTML documents that can be replaced with actual PDFs later

INSERT INTO public.legal_documents (document_type, file_url, version, is_current, uploaded_by)
VALUES 
  (
    'terms_of_service',
    'https://nuevageneracion.lovable.app/legal-docs/terms-of-service.html',
    1,
    true,
    (SELECT id FROM auth.users WHERE email = 'jpierreleignadier@gmail.com' LIMIT 1)
  ),
  (
    'privacy_policy',
    'https://nuevageneracion.lovable.app/legal-docs/privacy-policy.html',
    1,
    true,
    (SELECT id FROM auth.users WHERE email = 'jpierreleignadier@gmail.com' LIMIT 1)
  ),
  (
    'volunteering_rules',
    'https://nuevageneracion.lovable.app/legal-docs/volunteering-rules.html',
    1,
    true,
    (SELECT id FROM auth.users WHERE email = 'jpierreleignadier@gmail.com' LIMIT 1)
  )
ON CONFLICT (document_type, version) DO NOTHING;