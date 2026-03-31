# ⚠️ URGENT: Apply RLS Fix Now

## The Error You're Seeing

```
RLS infinite recursion detected in policy for relation "users"
```

This happens because RLS policies are querying the `users` table to check admin status, which triggers the same policy again → infinite loop.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy and Run the Fix
1. Open the file: `supabase/fix-rls-complete.sql` in your codebase
2. **Copy the ENTIRE contents** (all 131 lines)
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button (or press Cmd/Ctrl + Enter)

### Step 3: Verify It Worked
After running, you should see:
- ✅ No errors
- ✅ A table showing policies (at the end of the script output)

### Step 4: Refresh Your App
1. Go back to your application
2. **Hard refresh** the page (Cmd/Ctrl + Shift + R)
3. Logout and login again
4. The error should be gone!

## What the Script Does

1. ✅ Creates `is_admin()` function that bypasses RLS (prevents recursion)
2. ✅ Drops all problematic policies
3. ✅ Recreates policies using `is_admin()` function
4. ✅ Ensures users can access their own data
5. ✅ Grants admin access properly

## If You Still See Errors

### Check 1: Verify Function Exists
Run this in SQL Editor:
```sql
SELECT proname FROM pg_proc WHERE proname = 'is_admin';
```
Should return: `is_admin`

### Check 2: Verify Policies Use Function
Run this in SQL Editor:
```sql
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname LIKE '%Admin%';
```
The `qual` column should contain `is_admin()` NOT `SELECT 1 FROM public.users`

### Check 3: Emergency Fix
If policies still have old pattern, run this:
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;

-- Recreate with function
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

## Why This Happens

The RLS policy was checking admin status like this:
```sql
-- ❌ BAD: Causes infinite recursion
USING (
  EXISTS (
    SELECT 1 FROM public.users  -- This queries the same table!
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

The fix uses a security definer function:
```sql
-- ✅ GOOD: Uses function that bypasses RLS
USING (public.is_admin())
```

The `SECURITY DEFINER` function runs with elevated privileges and can query the users table without triggering RLS policies, breaking the recursion.

