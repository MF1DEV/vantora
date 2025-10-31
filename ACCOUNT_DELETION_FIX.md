# Account Deletion Fix - Setup Instructions

## Problem
Account deletion is failing due to RLS (Row Level Security) policies blocking the deletion of related data.

## Solution
We've created a PostgreSQL function that runs with elevated privileges (`SECURITY DEFINER`) to properly delete all user data.

## How to Apply the Fix

### Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
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
```

6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned"

### Step 2: Verify the Function Works

After running the migration, you can test it in the SQL Editor:

```sql
-- Test the function (replace with an actual user_id to delete)
SELECT delete_user_account('your-user-id-here');
```

### Step 3: Test Account Deletion

Now try deleting an account:
1. From the Settings page in your app
2. From Supabase Dashboard → Authentication → Users → Delete user

Both should now work properly!

## What This Does

The `delete_user_account()` function:
1. ✅ Deletes analytics data
2. ✅ Deletes all links
3. ✅ Deletes audit logs
4. ✅ Deletes the user profile
5. ✅ Deletes the auth.users entry
6. ✅ Bypasses RLS policies (using SECURITY DEFINER)
7. ✅ Runs in a transaction (all or nothing)

## If You Still Have Issues

If deletion still fails, check:
1. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables
2. Check Supabase logs: Dashboard → Logs → API Logs
3. Look for any foreign key constraints that might be blocking deletion

## Alternative: Delete from Supabase Dashboard

If you need to manually delete a user from the dashboard:
1. Go to SQL Editor
2. Run:
```sql
SELECT delete_user_account('USER_ID_HERE');
```

This will completely remove the user and all their data.
