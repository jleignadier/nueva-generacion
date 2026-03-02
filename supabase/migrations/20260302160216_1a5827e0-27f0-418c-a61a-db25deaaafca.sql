DROP FUNCTION IF EXISTS public.get_user_leaderboard(integer);

CREATE OR REPLACE FUNCTION public.get_user_leaderboard(p_limit integer DEFAULT 50)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, avatar_url text, organization_name text, points integer, total_hours numeric, events_attended integer, rank bigint, created_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    up.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    o.name AS organization_name,
    up.points,
    up.total_hours,
    up.events_attended,
    RANK() OVER (ORDER BY up.points DESC, up.events_attended DESC) AS rank,
    p.created_at
  FROM public.user_points up
  JOIN public.profiles p ON up.user_id = p.id
  LEFT JOIN public.organizations o ON p.organization_id = o.id
  ORDER BY up.points DESC, up.events_attended DESC
  LIMIT p_limit;
$function$;