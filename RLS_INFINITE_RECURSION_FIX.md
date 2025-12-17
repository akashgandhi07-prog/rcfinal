# RLS Infinite Recursion Fix

## Problem

The application was experiencing an infinite recursion error in Supabase RLS (Row Level Security) policies:

```
Error: infinite recursion detected in policy for relation "users"
```

### Root Cause

The RLS policies on the `users` table were querying the `users` table itself to check if a user is an admin. This created an infinite loop:

1. User tries to query `users` table
2. RLS policy checks if user is admin by querying `users` table
3. That query triggers the same RLS policy again
4. Which checks if user is admin by querying `users` table
5. And so on... (infinite recursion)

**Example of problematic policy:**
```sql
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users  -- ❌ This queries the same table!
    WHERE id::text = auth.uid()::text AND role = 'admin'
  )
)
```

## Solution

Created a **security definer function** that bypasses RLS to check user roles. This function runs with elevated privileges and can query the `users` table without triggering RLS policies.

**Fixed approach:**
```sql
-- Create security definer function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$;

-- Use the function in policies
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin())  -- ✅ Uses function instead of direct query
WITH CHECK (public.is_admin());
```

## Files Updated

1. **`supabase/fix-rls-infinite-recursion.sql`** - New file with the complete fix
2. **`supabase/fix-rls-complete.sql`** - Updated to use the security definer function
3. **`supabase/security-hardening.sql`** - Updated all admin policies to use the function

## How to Apply the Fix

### Option 1: Quick Fix (Recommended)

Run the dedicated fix script:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/fix-rls-infinite-recursion.sql`
3. Copy and paste the entire script
4. Click **Run** to execute

This will:
- Create the `is_admin()` security definer function
- Drop all problematic admin policies
- Recreate all admin policies using the function
- Fix policies on all tables (users, links, UCAT, portfolio, etc.)

### Option 2: Use Updated Complete Fix

If you need to reapply all RLS policies:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/fix-rls-complete.sql`
3. Copy and paste the entire script
4. Click **Run** to execute

### Option 3: Use Security Hardening Script

If you want comprehensive security hardening:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/security-hardening.sql`
3. Copy and paste the entire script
4. Click **Run** to execute

## Verification

After applying the fix, verify it worked:

```sql
-- Check that policies use the function
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%is_admin%' THEN 'Uses is_admin() function'
    ELSE 'Does not use is_admin()'
  END as uses_function
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- Test the function (should return true for admins)
SELECT public.is_admin() as current_user_is_admin;
```

## Testing

After applying the fix:

1. **Logout** from the application
2. **Login** again with your credentials
3. The error should be gone and you should be able to access the portal

## Technical Details

### Security Definer Functions

- `SECURITY DEFINER` functions run with the privileges of the function owner (usually a superuser)
- They bypass RLS policies when querying tables
- This allows checking user roles without triggering infinite recursion
- The function is marked as `STABLE` for query optimization

### Why This Works

1. When a policy calls `is_admin()`, the function executes with elevated privileges
2. The function can query `users` table without triggering RLS
3. The policy gets a boolean result without recursive queries
4. No infinite loop occurs

## Prevention

To prevent this issue in the future:

- ✅ **Always use security definer functions** when RLS policies need to check the same table
- ✅ **Never query the protected table directly** in RLS policy USING/WITH CHECK clauses
- ✅ **Use helper functions** for role checks across multiple policies
- ❌ **Don't use** `EXISTS (SELECT 1 FROM table WHERE ...)` in policies on the same table

## Related Files

- `lib/supabase/queries.ts` - Contains `getCurrentUser()` that was failing
- `components/providers/auth-provider.tsx` - Calls `getCurrentUser()` on mount
- `supabase/fix-rls-infinite-recursion.sql` - The fix script
- `supabase/fix-rls-complete.sql` - Complete RLS fix (updated)
- `supabase/security-hardening.sql` - Security hardening (updated)

