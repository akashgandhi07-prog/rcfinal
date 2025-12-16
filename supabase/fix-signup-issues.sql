-- ============================================
-- FIX SIGNUP ISSUES - Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create user_role enum if it doesn't exist, then add 'mentor'
DO $$
BEGIN
  -- First, check if user_role enum type exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Create the enum with base values
    CREATE TYPE user_role AS ENUM ('admin', 'student', 'parent');
  END IF;
  
  -- Then check if 'mentor' value already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'mentor' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    -- Add 'mentor' to the enum
    ALTER TYPE user_role ADD VALUE 'mentor';
  END IF;
END
$$;

-- Step 2: Create users table if it doesn't exist, then add missing columns
DO $$
BEGIN
  -- Check if users table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    -- Create users table with basic structure
    -- First ensure we have the required enums
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_course') THEN
      CREATE TYPE target_course AS ENUM ('medicine', 'dentistry', 'veterinary');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
      CREATE TYPE onboarding_status AS ENUM ('pending', 'complete');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
      CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    -- Create the users table
    CREATE TABLE public.users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role user_role NOT NULL DEFAULT 'student',
      full_name TEXT,
      target_course target_course,
      onboarding_status onboarding_status NOT NULL DEFAULT 'pending',
      approval_status approval_status NOT NULL DEFAULT 'pending',
      date_of_birth DATE,
      home_address TEXT,
      contact_number TEXT,
      parent_name TEXT,
      parent_phone TEXT,
      parent_email TEXT,
      parent2_name TEXT,
      parent2_phone TEXT,
      parent2_email TEXT,
      school_name TEXT,
      gcse_summary TEXT,
      a_level_predictions TEXT,
      consultant_assigned TEXT,
      contract_status TEXT DEFAULT 'Active',
      client_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
    CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON public.users(onboarding_status);
  END IF;
  
  -- Now add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'entry_year'
  ) THEN
    ALTER TABLE public.users ADD COLUMN entry_year INTEGER;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE public.users ADD COLUMN country TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'fee_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN fee_status TEXT;
  END IF;
END
$$;

-- Step 3: Create fee_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_status') THEN
    CREATE TYPE fee_status AS ENUM ('home', 'international', 'unsure');
  END IF;
END
$$;

-- Step 4: Update fee_status column to use enum (if column exists as TEXT)
-- Note: This might fail if there's data, so check first
DO $$
BEGIN
  -- Check if fee_status column exists and is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'fee_status' 
    AND data_type = 'text'
  ) THEN
    -- Convert TEXT to enum (this will fail if there's invalid data)
    ALTER TABLE public.users 
    ALTER COLUMN fee_status TYPE fee_status USING fee_status::fee_status;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'fee_status'
  ) THEN
    -- Create column as enum type
    ALTER TABLE public.users 
    ADD COLUMN fee_status fee_status;
  END IF;
END
$$;

-- Step 5: Check RLS policies - ensure users can insert their own profile
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Also allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Step 6: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('entry_year', 'country', 'fee_status', 'role')
ORDER BY column_name;

-- Check enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Check if fee_status enum exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fee_status')
ORDER BY enumsortorder;

