
-- Fix 1: Harden award_event_points with auth, authorization, and validation checks
CREATE OR REPLACE FUNCTION public.award_event_points(p_user_id uuid, p_event_id uuid, p_check_in_method check_in_method)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_points INTEGER;
  v_hours NUMERIC(5,2);
  v_org_id UUID;
  v_caller UUID;
BEGIN
  -- Authentication check
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Authorization based on check-in method
  IF p_check_in_method = 'manual' THEN
    -- Manual check-in ONLY by admins
    IF NOT has_role(v_caller, 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can manually check in users';
    END IF;
  ELSIF p_check_in_method = 'qr_scan' THEN
    -- QR scan: user can check themselves in, or admin can do it
    IF NOT (v_caller = p_user_id OR has_role(v_caller, 'admin'::app_role)) THEN
      RAISE EXCEPTION 'You can only check yourself in via QR scan';
    END IF;
  END IF;

  -- Validate user is registered for this event
  IF NOT EXISTS (
    SELECT 1 FROM public.event_registrations
    WHERE event_id = p_event_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User is not registered for this event';
  END IF;

  -- Check for duplicate attendance
  IF EXISTS (
    SELECT 1 FROM public.event_attendance
    WHERE event_id = p_event_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Attendance already recorded for this event';
  END IF;

  -- Get event points and hours
  SELECT points_earned, volunteer_hours INTO v_points, v_hours
  FROM public.events
  WHERE id = p_event_id;

  IF v_points IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Insert attendance record
  INSERT INTO public.event_attendance (
    event_id, user_id, points_awarded, hours_credited, check_in_method
  ) VALUES (
    p_event_id, p_user_id, v_points, v_hours, p_check_in_method
  );

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
