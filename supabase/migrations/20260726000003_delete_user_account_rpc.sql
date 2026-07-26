-- Migration: Create RPC function for cascade account deletion (zero orphaned data)

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get ID of caller
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete applications submitted by creator
  DELETE FROM public.applications WHERE creator_id = current_user_id;

  -- 2. Delete submissions by creator
  DELETE FROM public.submissions WHERE creator_id = current_user_id;

  -- 3. Delete notifications for user
  DELETE FROM public.notifications WHERE user_id = current_user_id;

  -- 4. Delete creator record
  DELETE FROM public.creators WHERE id = current_user_id;

  -- 5. Delete brand record if exists
  DELETE FROM public.brands WHERE id = current_user_id;

  -- 6. Delete profile record
  DELETE FROM public.profiles WHERE id = current_user_id;

  -- 7. Delete auth user record from auth.users schema
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
