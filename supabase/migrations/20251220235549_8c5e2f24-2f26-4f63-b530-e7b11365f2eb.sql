-- Mark old separate terms_of_service and privacy_policy documents as not current
UPDATE public.legal_documents 
SET is_current = false 
WHERE document_type IN ('terms_of_service', 'privacy_policy');

-- Update the has_accepted_legal_docs function to only check for the new document types
CREATE OR REPLACE FUNCTION public.has_accepted_legal_docs(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.legal_documents ld
    WHERE ld.is_current = true
    AND ld.document_type IN ('terms_and_privacy', 'volunteering_rules')
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_legal_acceptance ula
      WHERE ula.user_id = p_user_id
      AND ula.document_type = ld.document_type
      AND ula.version_accepted = ld.version
    )
  );
$function$;