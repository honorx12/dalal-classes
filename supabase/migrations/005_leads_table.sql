-- LeadDesk Mini Database Setup
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Create leads table
-- ============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for the public form)
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads" ON public.leads
  FOR INSERT TO public
  WITH CHECK (true);

-- Policy: Only admins can view leads
DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
CREATE POLICY "Only admins can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
  ));

-- Policy: Only admins can update leads
DROP POLICY IF EXISTS "Only admins can update leads" ON public.leads;
CREATE POLICY "Only admins can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
  ));

-- Policy: Only admins can delete leads
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
CREATE POLICY "Only admins can delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
  ));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at_column();

-- ============================================
-- STEP 2: Add role column to profiles (if not exists)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- ============================================
-- STEP 3: Create password reset OTP table
-- ============================================
CREATE TABLE IF NOT EXISTS public.password_reset_otp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email ON public.password_reset_otp(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expires ON public.password_reset_otp(expires_at);

-- Enable RLS on OTP table
ALTER TABLE public.password_reset_otp ENABLE ROW LEVEL SECURITY;

-- Policy: Only the user can view their own OTP
DROP POLICY IF EXISTS "Users can view own OTP" ON public.password_reset_otp;
CREATE POLICY "Users can view own OTP" ON public.password_reset_otp
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policy: Anyone can create OTP (for forgot password)
DROP POLICY IF EXISTS "Anyone can create OTP" ON public.password_reset_otp;
CREATE POLICY "Anyone can create OTP" ON public.password_reset_otp
  FOR INSERT TO public WITH CHECK (true);

-- ============================================
-- STEP 4: Create function to cleanup expired OTPs
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_otp
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Set honorthygus@gmail.com as admin
-- ============================================
-- First, find the user by email and set role
UPDATE public.profiles 
SET 
  role = 'admin',
  is_admin = TRUE
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'honorthygus@gmail.com'
);

-- Verify the update
SELECT 
  p.id,
  u.email,
  p.role,
  p.is_admin
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'honorthygus@gmail.com';
