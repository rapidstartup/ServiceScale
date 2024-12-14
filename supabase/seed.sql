-- Enable the crypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update existing users to confirm emails and reset passwords
UPDATE auth.users 
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'user@example.com';

UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = jsonb_build_object('is_admin', true),
  updated_at = NOW()
WHERE email = 'admin@admin.com';

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read for admins" ON public.customers;
DROP POLICY IF EXISTS "Enable read for user's own data" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON public.customers;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON public.customers;
DROP POLICY IF EXISTS "Enable access for admins and own data for users" ON public.customers;
DROP POLICY IF EXISTS "Customers access policy" ON public.customers;

-- Simplified customer policies
CREATE POLICY "Customers access policy"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'is_admin' = 'true'
      ) THEN true
      ELSE auth.uid() = user_id
    END
  )
  WITH CHECK (
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'is_admin' = 'true'
      ) THEN true
      ELSE auth.uid() = user_id
    END
  );

-- Drop pricebook policies
DROP POLICY IF EXISTS "Enable read for admins" ON public.pricebook_entries;
DROP POLICY IF EXISTS "Enable read for user's own data" ON public.pricebook_entries;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON public.pricebook_entries;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON public.pricebook_entries;

-- Pricebook policies
CREATE POLICY "Enable read for admins"
  ON public.pricebook_entries
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Enable read for user's own data"
  ON public.pricebook_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for user's own data"
  ON public.pricebook_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for admins or own data"
  ON public.pricebook_entries
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin() OR auth.uid() = user_id);

-- Templates policies (updated)
DROP POLICY IF EXISTS "Enable read for admins" ON public.templates;
DROP POLICY IF EXISTS "Enable read for user's own data" ON public.templates;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON public.templates;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON public.templates;
DROP POLICY IF EXISTS "Enable read for all users" ON public.templates;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.templates;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.templates;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.templates;

-- New template policies
CREATE POLICY "Enable read for all users"
  ON public.templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for admins only"
  ON public.templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

CREATE POLICY "Enable update for admins only"
  ON public.templates
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Enable delete for admins only"
  ON public.templates
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- Add back the default template
INSERT INTO public.templates (id, name, description, is_default, sections, user_id)
VALUES (
  'b98e7c00-2e9b-4a7b-9436-3b126ffa4983',
  'Default Template',
  'Standard template for HVAC quotes',
  true,
  '[
    {
      "title": "Project Overview",
      "content": "This proposal outlines the HVAC installation project for your property."
    },
    {
      "title": "Scope of Work",
      "content": "Our team will perform the following services:"
    },
    {
      "title": "Equipment Details",
      "content": "We will install the following equipment:"
    },
    {
      "title": "Project Timeline",
      "content": "The project will be completed within the following timeframe:"
    },
    {
      "title": "Warranty Information",
      "content": "All equipment and labor come with the following warranties:"
    },
    {
      "title": "Terms & Conditions",
      "content": "Please review our standard terms and conditions:"
    }
  ]'::jsonb,
  (SELECT id FROM auth.users WHERE email = 'admin@admin.com')
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default,
  sections = EXCLUDED.sections;

-- Drop quotes policies
DROP POLICY IF EXISTS "Enable read for admins" ON public.quotes;
DROP POLICY IF EXISTS "Enable read for user's own data" ON public.quotes;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON public.quotes;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON public.quotes;

-- Quotes policies
CREATE POLICY "Enable read for admins"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Enable read for user's own data"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for user's own data"
  ON public.quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for admins or own data"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin() OR auth.uid() = user_id);

-- Drop settings policies
DROP POLICY IF EXISTS "Enable read for admins" ON public.settings;
DROP POLICY IF EXISTS "Enable read for user's own data" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON public.settings;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON public.settings;

-- Settings policies
CREATE POLICY "Enable read for admins"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "Enable read for user's own data"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for user's own data"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for admins or own data"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin() OR auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  