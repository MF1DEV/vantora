-- Create a function to delete a user and all their data
-- This function runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete analytics data
  DELETE FROM analytics WHERE analytics.user_id = delete_user_account.user_id;
  
  -- Delete links
  DELETE FROM links WHERE links.user_id = delete_user_account.user_id;
  
  -- Delete audit logs
  DELETE FROM audit_logs WHERE audit_logs.user_id = delete_user_account.user_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE profiles.id = delete_user_account.user_id;
  
  -- Delete auth user
  DELETE FROM auth.users WHERE auth.users.id = delete_user_account.user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO service_role;

COMMENT ON FUNCTION delete_user_account IS 'Safely deletes a user account and all associated data with proper cascading';
