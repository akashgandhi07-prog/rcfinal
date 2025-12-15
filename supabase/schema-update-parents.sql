-- Update users table to support 2 parents with email addresses
-- Run this SQL in your Supabase SQL editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS parent2_name TEXT,
ADD COLUMN IF NOT EXISTS parent2_phone TEXT,
ADD COLUMN IF NOT EXISTS parent2_email TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- Optional: Rename existing parent fields for clarity
-- ALTER TABLE public.users RENAME COLUMN parent_name TO parent1_name;
-- ALTER TABLE public.users RENAME COLUMN parent_phone TO parent1_phone;
-- ALTER TABLE public.users RENAME COLUMN parent_email TO parent1_email;

