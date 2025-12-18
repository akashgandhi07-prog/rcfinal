# Apply RLS Infinite Recursion Fix

## Quick Fix Instructions

The infinite recursion error occurs because RLS policies on the `users` table are querying the `users` table itself. This creates an infinite loop.

### Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Fix Script**
   - Open the file: `supabase/fix-rls-infinite-recursion.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify the Fix**
   - The script includes verification queries at the end
   - Check that all policies show "Uses is_admin() function"

4. **Test the Application**
   - Logout from your application
   - Login again
   - The error should be resolved

## What the Fix Does

1. **Creates `is_admin()` function**: A security definer function that bypasses RLS to check if a user is an admin
2. **Drops problematic policies**: Removes all policies that query the `users` table directly
3. **Recreates policies**: Uses the `is_admin()` function instead of direct queries
4. **Ensures basic access**: Creates policies so users can view their own data

## Important Notes

- This fix must be applied in the Supabase SQL Editor (database level)
- The fix is safe to run multiple times (it uses `DROP POLICY IF EXISTS` and `CREATE OR REPLACE`)
- After applying, users will need to refresh/login again

## If the Error Persists

If you still see the error after applying the fix:

1. Check that the `is_admin()` function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'is_admin';
   ```

2. Check that policies use the function:
   ```sql
   SELECT policyname, qual 
   FROM pg_policies 
   WHERE tablename = 'users' 
   AND policyname LIKE '%Admin%';
   ```
   The `qual` column should contain `is_admin()` not `SELECT 1 FROM public.users`

3. If policies still have the old pattern, manually drop and recreate them using the fix script

