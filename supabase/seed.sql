-- Enable the crypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS pricebook_entries CASCADE;

-- Create tables with correct columns
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    "Names" TEXT,
    "Address1" TEXT,
    "City" TEXT,
    "State" TEXT,
    "PostalCode" TEXT,
    "CombinedAddress" TEXT,
    user_id UUID REFERENCES auth.users(id),
    "uploadId" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE templates (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    template_id BIGINT REFERENCES templates(id),
    content TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricebook_entries (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Insert seed data as before...
[Previous seed data section remains unchanged]

-- Drop existing policies
DROP POLICY IF EXISTS "Customers access policy" ON customers;
DROP POLICY IF EXISTS "Enable read for admins" ON customers;
DROP POLICY IF EXISTS "Enable read for user's own data" ON customers;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON customers;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON customers;

DROP POLICY IF EXISTS "Enable read for all users" ON templates;
DROP POLICY IF EXISTS "Enable insert for admins only" ON templates;
DROP POLICY IF EXISTS "Enable update for admins only" ON templates;
DROP POLICY IF EXISTS "Enable delete for admins only" ON templates;

DROP POLICY IF EXISTS "Enable read for admins" ON quotes;
DROP POLICY IF EXISTS "Enable read for user's own data" ON quotes;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON quotes;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON quotes;

DROP POLICY IF EXISTS "Enable read for admins" ON pricebook_entries;
DROP POLICY IF EXISTS "Enable read for user's own data" ON pricebook_entries;
DROP POLICY IF EXISTS "Enable insert for user's own data" ON pricebook_entries;
DROP POLICY IF EXISTS "Enable update for admins or own data" ON pricebook_entries;

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricebook_entries ENABLE ROW LEVEL SECURITY;

-- Grant access to auth.users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Customers table policies
CREATE POLICY "Admin full access to customers"
ON customers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
);

CREATE POLICY "Users access own customers"
ON customers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Templates table policies
CREATE POLICY "Admin full access to templates"
ON templates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
);

CREATE POLICY "Users read templates"
ON templates
FOR SELECT
TO authenticated
USING (true);

-- Quotes table policies
CREATE POLICY "Admin full access to quotes"
ON quotes
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
);

CREATE POLICY "Users access own quotes"
ON quotes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pricebook entries table policies
CREATE POLICY "Admin full access to pricebook_entries"
ON pricebook_entries
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
);

CREATE POLICY "Users access own pricebook_entries"
ON pricebook_entries
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON templates TO authenticated;
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON pricebook_entries TO authenticated;
GRANT USAGE ON SEQUENCE customers_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE templates_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE quotes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE pricebook_entries_id_seq TO authenticated; 