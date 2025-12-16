-- Create or update a super admin profile for Akash Gandhi
-- Steps:
-- 1) In Supabase Dashboard > Authentication > Users, create (or confirm) the auth user:
--      Email: akashgandhi07@gmail.com
--      Password: choose a strong password
--      Auto-confirm: ON
-- 2) Run this SQL to upsert the profile and grant admin role/approval/onboarding complete.
--    Use the service role or run in the SQL editor as a superuser.

-- Ensure the user exists in auth
-- (This select is informational; it does not modify data)
select id, email, created_at from auth.users where email = 'akashgandhi07@gmail.com';

-- Upsert into public.users to grant admin privileges
insert into public.users (id, email, full_name, role, approval_status, onboarding_status)
select id, email, 'Akash Gandhi', 'admin', 'approved', 'complete'
from auth.users
where email = 'akashgandhi07@gmail.com'
on conflict (id) do update
set role = 'admin',
    full_name = excluded.full_name,
    approval_status = 'approved',
    onboarding_status = 'complete';

-- Optional: mark as target course for clarity (no-op if not needed)
update public.users
set target_course = coalesce(target_course, null),
    entry_year = coalesce(entry_year, null)
where email = 'akashgandhi07@gmail.com';

