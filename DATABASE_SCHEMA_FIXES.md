# Database Schema Fixes & Testing Guide

## Issues Found and Fixed

### 1. Missing Columns in Users Table ✅
The main `schema.sql` was missing several columns that the application code expects:
- ✅ Added `approval_status` (enum: 'pending', 'approved', 'rejected')
- ✅ Added `contact_number` (TEXT)
- ✅ Added `entry_year` (INTEGER)
- ✅ Added `country` (TEXT)
- ✅ Added `fee_status` (TEXT with CHECK constraint)
- ✅ Added `parent2_name`, `parent2_phone`, `parent2_email` (for second parent)
- ✅ Changed `id` from `DEFAULT uuid_generate_v4()` to just `UUID PRIMARY KEY` (matches Supabase Auth)

### 2. Missing Role in Enum ✅
- ✅ Added 'mentor' to `user_role` enum

### 3. Missing Tables ✅
Added to main schema:
- ✅ `portfolio_activities` table
- ✅ `university_strategies` table

### 4. Additional Tables Required
These tables are in separate schema files and should be run after the main schema:
- `mentor_student_links` (from `supabase/mentor-schema.sql`)
- `mentor_comments` (from `supabase/mentor-schema.sql`)
- `student_documents` (from `supabase/document-management-schema.sql`)
- `messages` (from `supabase/messages-schema.sql`)
- `resources` (from `supabase/resources-schema.sql`)

## Database Setup Order

Run these SQL files in order:

1. **Main Schema**: `supabase/schema.sql` (now includes all core tables)
2. **Mentor Schema**: `supabase/mentor-schema.sql`
3. **Document Management**: `supabase/document-management-schema.sql`
4. **Messages**: `supabase/messages-schema.sql`
5. **Resources**: `supabase/resources-schema.sql`
6. **Security Hardening**: `supabase/security-hardening.sql` (optional but recommended)

## Testing Checklist

### Login Flow Testing
- [ ] **New User Signup**: Create a new account and verify:
  - User is created in `auth.users`
  - User profile is created in `public.users` with `approval_status = 'pending'`
  - User cannot login until approved
  - User receives appropriate error message

- [ ] **Approved User Login**: Login with an approved account:
  - Login succeeds
  - User is redirected to `/portal`
  - User sees appropriate dashboard based on role

- [ ] **Admin Login**: Login with admin account:
  - Login succeeds immediately (admins bypass approval)
  - Admin sees admin view
  - Admin can access all sections

- [ ] **Pending User**: Try to login with pending account:
  - Login fails with "pending approval" message
  - User is signed out automatically

### Navigation Links Testing
Test all sidebar navigation links:

- [ ] **Dashboard/Overview**: Loads correctly, shows user data
- [ ] **My Profile**: Loads profile view, can edit profile
- [ ] **Portfolio**: Loads portfolio builder, can add/edit activities
- [ ] **UCAT Performance**: Loads UCAT tracker (if applicable to course)
- [ ] **University Strategy**: Loads strategy kanban board
- [ ] **Interview Prep**: Loads interview prep view
- [ ] **Messages**: Loads messages view (if implemented)
- [ ] **Resource Library**: Loads resources view (if implemented)
- [ ] **Settings**: Loads settings view
- [ ] **Admin** (if admin): Loads admin view with all tabs

### Role-Based Access Testing

#### Student Role
- [ ] Can view own dashboard
- [ ] Can edit own profile
- [ ] Can manage own portfolio
- [ ] Can view own UCAT data
- [ ] Can manage own university strategy
- [ ] Cannot access admin view
- [ ] Cannot view other students' data

#### Parent Role
- [ ] Can view linked students' dashboards
- [ ] Can view linked students' profiles (read-only)
- [ ] Can view linked students' portfolios
- [ ] Can view linked students' UCAT data
- [ ] Can view linked students' university strategies
- [ ] Cannot edit student data (unless permissions allow)
- [ ] Cannot access admin view

#### Mentor Role
- [ ] Can view linked students' dashboards
- [ ] Can view and comment on linked students' data
- [ ] Can add mentor comments
- [ ] Cannot access admin view

#### Admin Role
- [ ] Can view all users
- [ ] Can edit any user's data
- [ ] Can manage user relationships (parent-student, mentor-student)
- [ ] Can approve/reject user accounts
- [ ] Can access all admin tabs
- [ ] Can impersonate users

### Database Structure Verification

Run this SQL to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- users
- parent_student_links
- mentor_student_links (if mentor schema run)
- mentor_comments (if mentor schema run)
- feature_toggles
- ucat_mocks
- portfolio_activities
- university_strategies
- student_documents (if document schema run)
- messages (if messages schema run)
- resources (if resources schema run)

### Verify Users Table Columns

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
```

Should include:
- id, email, role, full_name, target_course
- onboarding_status, approval_status
- contact_number, entry_year, country, fee_status
- date_of_birth, home_address
- parent_name, parent_phone, parent_email
- parent2_name, parent2_phone, parent2_email
- school_name, gcse_summary, a_level_predictions
- consultant_assigned, contract_status, client_id
- created_at, updated_at

## Common Issues & Solutions

### Issue: "Column approval_status does not exist"
**Solution**: Run the updated `schema.sql` or add the column manually:
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mentor';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status approval_status NOT NULL DEFAULT 'pending';
```

### Issue: "Role mentor does not exist"
**Solution**: Add mentor to enum:
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mentor';
```

### Issue: Login fails with "User not found"
**Solution**: Ensure user profile exists in `public.users` table. The login code creates it automatically, but if it fails, create manually:
```sql
INSERT INTO public.users (id, email, role, approval_status, onboarding_status)
VALUES (
  'user-uuid-from-auth',
  'user@example.com',
  'student',
  'approved',
  'complete'
);
```

## Next Steps

1. Run the updated `schema.sql` in Supabase SQL Editor
2. Run additional schema files as needed (mentor, documents, messages, resources)
3. Test login flow with different user roles
4. Test all navigation links
5. Verify RLS policies are working correctly
6. Test role-based access control

