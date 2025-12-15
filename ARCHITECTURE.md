# Regent's Private Client Portal - Architecture Documentation

## Overview

A secure, multi-role web application with role-based access control, dynamic dashboard rendering, and medical record-style UI.

## Database Schema (Supabase/PostgreSQL)

### Tables Created

1. **users** - Main user profile table
   - Roles: `admin`, `student`, `parent`
   - Tracks onboarding status, target course, personal & academic data
   - RLS policies ensure data isolation

2. **parent_student_links** - Links parents to students
   - Many-to-many relationship (1 student can have multiple parents)
   - Admin-managed

3. **feature_toggles** - Per-user feature flags
   - Allows admins to enable/disable features per student
   - Features: UCAT tracker, Interview prep, Portfolio, etc.

4. **ucat_mocks** - UCAT test results
   - Tracks mock exam scores and progression
   - Only visible to relevant users (RLS)

### Row Level Security (RLS)

- **Students**: See only their own data
- **Parents**: See data of linked students only
- **Admins**: Full CRUD access to all data

## Project Structure

```
supabase/
  schema.sql                    # Complete database schema with RLS

lib/supabase/
  client.ts                     # Client-side Supabase instance
  server.ts                     # Server-side Supabase instance  
  queries.ts                    # Database query functions
  types.ts                      # TypeScript type definitions

components/
  onboarding/
    onboarding-wizard.tsx       # Multi-step registration flow
    
  dashboard/
    dashboard-shell.tsx         # Main layout wrapper
    sidebar.tsx                 # Navigation sidebar (dynamic)
    header.tsx                  # Top header
    views/
      profile-view.tsx          # Medical record-style profile
      ucat-tracker.tsx          # UCAT performance tracking
      strategy-kanban.tsx       # University strategy board

  ui/
    matte-input.tsx             # Underlined input style
    matte-textarea.tsx          # Underlined textarea style

app/portal/
  page.tsx                      # Main portal page with routing logic
```

## Key Features

### 1. Onboarding Flow

- **3-step wizard** for new users
- Step 1: Personal Details (name, DOB, address, parent info)
- Step 2: Academic Baseline (school, GCSE, A-Level predictions)
- Step 3: Course Selection (Medicine/Dentistry/Veterinary)
- Redirects to dashboard only after completion

### 2. Dynamic Dashboard

- **Course-based rendering**:
  - Veterinary → UCAT Performance hidden
  - Medicine/Dentistry → UCAT & BMAT visible
  
- **Feature toggles**:
  - Admins can enable/disable features per student
  - Stored in `feature_toggles` table

### 3. Role-Based Access

- **Admin**: Full access, can link parents to students, manage feature toggles
- **Student**: Own data only, can update profile
- **Parent**: Read-only access to linked student data

### 4. UI Design System

- **Background**: Light Slate (#F8FAFC) for readability
- **Sidebar**: Deep Navy (#0B1120)
- **Accents**: Muted Gold (#D4AF37)
- **Inputs**: Underlined "matte" style (border-b only)
- **Buttons**: Sharp corners (rounded-none), gold borders, uppercase text

## Setup Instructions

1. **Install Supabase packages**:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Set up Supabase**:
   - Create Supabase project
   - Run `supabase/schema.sql` in SQL editor
   - Get project URL and anon key

3. **Environment variables**:
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Configure Auth**:
   - Enable Email provider in Supabase Dashboard
   - Configure email templates

## Next Steps

- [ ] Integrate Supabase Auth with login screen
- [ ] Implement parent-student linking in admin panel
- [ ] Connect UCAT tracker to database
- [ ] Add portfolio builder database integration
- [ ] Implement feature toggle UI in admin panel
- [ ] Add server-side data fetching with Next.js Server Components
- [ ] Add middleware for auth protection

## Notes

- All styling uses "Swiss Private Bank" aesthetic
- Sharp corners, matte inputs, medical record density
- RLS ensures security at database level
- Feature toggles allow per-user customization

