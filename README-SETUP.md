# Regent's Private Client Portal - Setup Guide

## Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project

## Installation

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   # or
   pnpm add @supabase/supabase-js @supabase/ssr
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key
   - Create a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Configure Authentication:**
   - In Supabase Dashboard, go to Authentication > Providers
   - Enable Email provider
   - Configure email templates as needed

4. **Set up RLS policies:**
   - The schema includes Row Level Security (RLS) policies
   - Ensure all tables have RLS enabled
   - Test policies with different user roles

## Database Schema Overview

### Tables
- `users` - User profiles with role-based access
- `parent_student_links` - Links parents to students
- `feature_toggles` - Feature flags per user
- `ucat_mocks` - UCAT test results

### Security
- RLS policies ensure users only see their own data
- Parents can view linked students' data
- Admins have full access

## Project Structure

```
app/
  portal/
    page.tsx          # Main portal page with auth & routing
components/
  onboarding/
    onboarding-wizard.tsx  # Multi-step registration
  dashboard/
    dashboard-shell.tsx    # Layout wrapper
    sidebar.tsx            # Navigation sidebar
    header.tsx             # Top header
    views/                 # Dashboard views
lib/
  supabase/
    client.ts             # Client-side Supabase
    server.ts             # Server-side Supabase
    queries.ts            # Database queries
    types.ts              # TypeScript types
supabase/
  schema.sql              # Database schema
```

## Features

- **Role-based access control** (Admin, Student, Parent)
- **Dynamic dashboard** based on target course
- **Feature toggles** for per-user customization
- **Onboarding flow** for new users
- **UCAT tracker** (hidden for Veterinary students)
- **Parent-student linking** (admin-managed)

