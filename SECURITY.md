# Security Guide

## Overview
This document outlines the security measures implemented in the Regent's Consultancy portal.

## Authentication & Authorization

### Login Flow
1. **Email/Password Authentication**: Uses Supabase Auth with secure password hashing
2. **Approval Status Check**: Non-admin users must be approved before accessing the portal
3. **Admin Bypass**: Admins can always login regardless of approval status
4. **Session Management**: Sessions expire after 1 hour of inactivity

### Registration Flow
1. **Email Verification**: New users receive a confirmation email
2. **Approval Required**: New accounts are set to `approval_status: "pending"`
3. **Admin Approval**: Admins must approve accounts before users can access

### Password Reset Flow
1. **Email-Based Reset**: Users request password reset via email
2. **Secure Token**: Supabase generates a secure, time-limited reset token
3. **One-Time Use**: Reset tokens are single-use and expire after a set time
4. **Redirect URL**: Reset links redirect to `/portal/reset-password`

## Role-Based Access Control (RBAC)

### Roles
- **Admin**: Full access to all data and user management
- **Student**: Access to own data and linked mentor/parent views
- **Parent**: View-only access to linked student data
- **Mentor**: Edit access to linked student data, can add comments

### RLS Policies
All database tables use Row Level Security (RLS) with policies that:
- Restrict access based on user role
- Allow admins full access to all data
- Enforce parent-student and mentor-student relationships
- Prevent unauthorized data access

## Security Measures

### 1. Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce role-based access
- Admins have comprehensive access policies

### 2. Role Escalation Prevention
- Users cannot change their own role to admin
- Only admins can change user roles
- Database triggers prevent role escalation

### 3. Auto-Approval for Admins
- Admins are automatically approved on creation
- Database trigger ensures admin approval status

### 4. Audit Logging
- Sensitive operations are logged
- Audit logs track:
  - User role changes
  - Parent-student linking
  - Mentor-student linking
  - Data modifications
- Only admins can view audit logs

### 5. Login Attempt Tracking
- Failed login attempts are tracked
- Rate limiting prevents brute force attacks
- Account lockout after 5 failed attempts (15-minute window)

### 6. Password Security
- Minimum 6 characters (recommended: 8+)
- Passwords are hashed using bcrypt
- Password visibility toggle for better UX
- Password reset requires email verification

### 7. Session Security
- Sessions expire after inactivity
- Secure cookie handling
- CSRF protection via Supabase

### 8. API Security
- All API calls use Supabase client (parameterized queries)
- No raw SQL with user input
- Service role key never exposed to client

## Admin Capabilities

### Complete Visibility
- View all users (students, parents, mentors, admins)
- View all relationships (student-parent-mentor links)
- View all data across all users

### User Management
- Create demo accounts
- Edit user roles
- Approve/reject user accounts
- Link parents to students
- Link mentors to students
- View audit logs
- View login attempts

### Data Access
- View any student's dashboard
- View any student's data
- Edit any user's information
- Access all tables without restrictions

## Security Best Practices

### For Developers
1. **Never expose service role key** in client-side code
2. **Always use parameterized queries** (Supabase client handles this)
3. **Validate user input** on both client and server
4. **Keep dependencies updated** (Supabase, Next.js, etc.)
5. **Review RLS policies** regularly
6. **Test security measures** after changes

### For Admins
1. **Use strong passwords** (8+ characters, mixed case, numbers, symbols)
2. **Enable 2FA** in Supabase Dashboard (recommended)
3. **Review audit logs** regularly
4. **Monitor login attempts** for suspicious activity
5. **Approve accounts carefully** - verify identity before approval
6. **Regular backups** - ensure database backups are configured

### For Users
1. **Use strong passwords**
2. **Don't share your account**
3. **Log out when finished**
4. **Report suspicious activity** to admins

## Security Configuration

### Supabase Dashboard Settings
1. **Authentication → URL Configuration**:
   - Set Site URL to production domain
   - Add redirect URLs for portal and reset-password

2. **Authentication → Settings**:
   - Enable email confirmations
   - Enable password reset
   - Configure email provider

3. **Database → RLS**:
   - Ensure RLS is enabled on all tables
   - Review policies regularly

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (NEVER expose to client)

## Security Checklist

### Initial Setup
- [ ] Run `supabase/security-hardening.sql` in Supabase SQL Editor
- [ ] Configure Supabase URL settings
- [ ] Enable email confirmations
- [ ] Enable password reset
- [ ] Create first admin account
- [ ] Test login flow
- [ ] Test registration flow
- [ ] Test password reset flow

### Regular Maintenance
- [ ] Review audit logs monthly
- [ ] Review login attempts for suspicious activity
- [ ] Update dependencies quarterly
- [ ] Review RLS policies after schema changes
- [ ] Test security measures after updates
- [ ] Backup database regularly

## Troubleshooting

### Login Issues
- **Problem**: User can't login even with correct credentials
- **Solution**: Check approval status - user may need admin approval

### Password Reset Not Working
- **Problem**: Reset email not received or link doesn't work
- **Solution**: 
  1. Check Supabase URL configuration
  2. Verify email provider settings
  3. Check spam folder
  4. Ensure redirect URL is in allowed list

### Access Denied Errors
- **Problem**: User gets "access denied" even when logged in
- **Solution**: 
  1. Check user role and approval status
  2. Verify RLS policies are correct
  3. Check if user is linked correctly (for parents/mentors)

### Admin Can't Access Data
- **Problem**: Admin can't see all users/data
- **Solution**: 
  1. Run `supabase/security-hardening.sql`
  2. Verify admin role in database
  3. Check RLS policies for admin access

## Reporting Security Issues

If you discover a security vulnerability:
1. **Do not** create a public issue
2. Contact the development team directly
3. Provide details of the vulnerability
4. Allow time for fix before disclosure

## Additional Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

