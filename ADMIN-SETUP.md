# Admin Setup & Security Implementation Guide

## What Was Fixed

### 1. Login Flow ✅
- **Fixed**: Login now properly checks approval status
- **Admin Bypass**: Admins can always login regardless of approval status
- **Error Handling**: Better error messages for pending/rejected accounts
- **Session Management**: Improved session handling and validation

### 2. Admin View Enhancement ✅
- **New Tab**: "All Relationships" tab showing complete student-parent-mentor relationships
- **Comprehensive View**: See all linked relationships in one place
- **Quick Actions**: Link/unlink parents and mentors directly from relationship view
- **User Management**: Enhanced "All Users" table with better filtering and actions

### 3. Security Hardening ✅
- **Comprehensive RLS Policies**: All tables have proper admin access policies
- **Role Escalation Prevention**: Users cannot change their own role to admin
- **Auto-Approval for Admins**: Admins are automatically approved
- **Audit Logging**: Sensitive operations are logged
- **Login Attempt Tracking**: Failed login attempts are tracked for security
- **Rate Limiting**: Account lockout after 5 failed attempts

## How to Set Up

### Step 1: Run Security Hardening SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/security-hardening.sql`
3. Copy and paste the entire script
4. Click **Run** to execute

This will:
- Create comprehensive admin RLS policies
- Add role escalation prevention
- Set up audit logging
- Create login attempt tracking
- Enable auto-approval for admins

### Step 2: Verify Admin Account

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your admin account
3. Verify:
   - Role is set to `admin`
   - Approval status is `approved`
   - Email is confirmed

If not set correctly:
```sql
-- Run in SQL Editor
UPDATE public.users 
SET role = 'admin', approval_status = 'approved' 
WHERE email = 'your-admin-email@example.com';
```

### Step 3: Test Login Flow

1. **Logout** if currently logged in
2. **Login** with admin credentials
3. You should see the admin dashboard immediately
4. Navigate to **Admin View** → **All Relationships** tab
5. Verify you can see all users and relationships

### Step 4: Test Password Reset

1. **Logout**
2. Click **"Forgot password?"** on login screen
3. Enter your email
4. Check email for reset link
5. Click reset link
6. Set new password
7. Login with new password

## Admin Features

### Complete Visibility
- **All Relationships Tab**: See every student with their linked parents and mentors
- **All Users Tab**: See all users (students, parents, mentors, admins) with their roles and status
- **Pending Approvals**: Quick access to accounts awaiting approval

### User Management
- **Create Demo Accounts**: Create test accounts for different roles
- **Edit User Roles**: Change user roles (student, parent, mentor, admin)
- **Approve/Reject Accounts**: Manage account approvals
- **Link Relationships**: Link parents to students, mentors to students
- **View Any Student**: Click "View" to see any student's dashboard

### Security Features
- **Audit Logs**: View all sensitive operations (role changes, linking, etc.)
- **Login Attempts**: Monitor failed login attempts
- **Complete Control**: Full access to all data and user management

## Admin View Layout

### Relationships Tab
- Shows all students in cards
- Each card displays:
  - Student name, email, role, course
  - Linked parents (with unlink option)
  - Linked mentors (with unlink option)
  - Quick action buttons to link new parents/mentors

### Users Tab
- **Pending Approvals**: Accounts awaiting approval
- **All Users Table**: Complete list of all users
- **Students Table**: List of all students with actions

## Security Measures

### What's Protected
1. **Role Escalation**: Users cannot make themselves admin
2. **Approval System**: Non-admins must be approved
3. **RLS Policies**: Database-level access control
4. **Audit Logging**: All sensitive operations logged
5. **Rate Limiting**: Brute force protection

### Admin Privileges
- **Full Access**: Admins can access all data
- **User Management**: Create, edit, approve users
- **Relationship Management**: Link/unlink parents and mentors
- **Audit Access**: View all audit logs and login attempts

## Troubleshooting

### Admin Can't Login
1. Check approval status in database:
   ```sql
   SELECT email, role, approval_status FROM public.users WHERE email = 'your-email@example.com';
   ```
2. If not approved, run:
   ```sql
   UPDATE public.users SET approval_status = 'approved', role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Can't See All Users
1. Verify admin role:
   ```sql
   SELECT role FROM public.users WHERE id::text = auth.uid()::text;
   ```
2. Run security hardening SQL again
3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname LIKE '%admin%';
   ```

### Relationships Not Showing
1. Verify links exist:
   ```sql
   SELECT * FROM parent_student_links;
   SELECT * FROM mentor_student_links;
   ```
2. Refresh the admin view
3. Check browser console for errors

### Password Reset Not Working
1. Check Supabase URL configuration:
   - Site URL should be your production domain
   - Redirect URLs should include `/portal/reset-password`
2. Check email provider settings
3. Verify email is confirmed in Supabase

## Quick Reference

### SQL Queries for Common Tasks

**Make a user admin:**
```sql
UPDATE public.users 
SET role = 'admin', approval_status = 'approved' 
WHERE email = 'user@example.com';
```

**Approve a user:**
```sql
UPDATE public.users 
SET approval_status = 'approved' 
WHERE email = 'user@example.com';
```

**View all relationships:**
```sql
SELECT 
  s.full_name as student,
  s.email as student_email,
  p.full_name as parent,
  p.email as parent_email,
  m.full_name as mentor,
  m.email as mentor_email
FROM users s
LEFT JOIN parent_student_links psl ON s.id = psl.student_id
LEFT JOIN users p ON psl.parent_id = p.id
LEFT JOIN mentor_student_links msl ON s.id = msl.student_id
LEFT JOIN users m ON msl.mentor_id = m.id
WHERE s.role = 'student';
```

**View audit logs:**
```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100;
```

**View login attempts:**
```sql
SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 100;
```

## Next Steps

1. ✅ Run security hardening SQL
2. ✅ Verify admin account
3. ✅ Test login flow
4. ✅ Test password reset
5. ✅ Review admin view
6. ✅ Set up 2FA for admin (recommended)
7. ✅ Configure email provider in Supabase
8. ✅ Review audit logs regularly

## Support

If you encounter issues:
1. Check `SECURITY.md` for security documentation
2. Review Supabase logs in Dashboard
3. Check browser console for errors
4. Verify RLS policies are correct
5. Ensure all SQL scripts have been run

