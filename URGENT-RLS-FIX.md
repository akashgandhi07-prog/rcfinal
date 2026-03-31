# ⚠️ URGENT: RLS Infinite Recursion Fix Required

## The Problem

You're seeing this error:
```
RLS infinite recursion detected in policy for relation "users"
```

This happens because RLS policies are querying the `users` table to check admin status, which triggers the same policy again, creating an infinite loop.

## The Solution

**You MUST run the SQL fix script in Supabase to resolve this.**

### Step-by-Step Instructions:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **"SQL Editor"** in the left sidebar

2. **Run the Fix Script**
   - Open the file: `supabase/fix-rls-complete.sql` in your codebase
   - **Copy the ENTIRE contents** of the file
   - Paste into the Supabase SQL Editor
   - Click **"Run"** button (or press Cmd/Ctrl + Enter)

3. **Verify It Worked**
   - The script will show a verification query at the end
   - You should see policies listed with `is_admin()` function
   - If you see errors, check the error message

4. **Refresh Your App**
   - Go back to your application
   - Refresh the page (Cmd/Ctrl + R)
   - The error should be gone

## What the Script Does

1. Creates `is_admin()` function that bypasses RLS
2. Drops all problematic policies
3. Recreates policies using the `is_admin()` function
4. Ensures users can access their own data

## If You Still See Errors

1. **Check if function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'is_admin';
   ```
   Should return `is_admin`

2. **Check policies:**
   ```sql
   SELECT policyname, qual 
   FROM pg_policies 
   WHERE tablename = 'users';
   ```
   Admin policies should show `is_admin()` not direct queries

3. **If still broken, run this emergency fix:**
   ```sql
   -- Temporarily disable RLS (NOT RECOMMENDED FOR PRODUCTION)
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
   Then immediately re-enable and fix properly:
   ```sql
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   -- Then run fix-rls-complete.sql again
   ```

## Important Notes

- ⚠️ **This fix MUST be applied in Supabase SQL Editor** - it cannot be fixed from the application code
- ✅ The script is safe to run multiple times
- ✅ It won't delete any data
- ✅ Users will need to refresh/login after the fix

## Quick Reference

**File to run:** `supabase/fix-rls-complete.sql`  
**Where to run:** Supabase Dashboard → SQL Editor  
**Time to fix:** ~30 seconds

