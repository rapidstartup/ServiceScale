-- Enable the crypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS pricebook_entries CASCADE;
DROP TABLE IF EXISTS OUTPUT CASCADE;

-- Create tables with correct columns
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    template_id UUID REFERENCES templates(id),
    content TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'active',
    service TEXT,
    total DECIMAL(10,2),
    property_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricebook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS OUTPUT (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    names TEXT,
    address1 TEXT,
    city TEXT,
    state TEXT,
    postalcode TEXT,
    combinedaddress TEXT,
    -- Add new property-related columns
    propertytype TEXT,
    propertysize TEXT,
    yearbuilt TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    lotsize TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Insert seed data
-- Admin templates
INSERT INTO templates (name, content, user_id)
SELECT 
    'Default Quote Template',
    'Dear {customer_name},\n\nThank you for your interest in our services. Here is your quote:\n\n{quote_details}\n\nTotal: ${total}\n\nBest regards,\nYour Company',
    id
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO templates (name, content, user_id)
SELECT 
    'Professional Quote Template',
    'Dear {customer_name},\n\nWe appreciate your business inquiry. Please find your customized quote below:\n\n{quote_details}\n\nSubtotal: ${subtotal}\nTax: ${tax}\nTotal: ${total}\n\nThis quote is valid for 30 days.\n\nBest regards,\nYour Company',
    id
FROM auth.users WHERE email = 'admin@admin.com';

-- Sample pricebook entries for admin
INSERT INTO pricebook_entries (name, price, description, user_id)
SELECT 
    'Basic Service',
    99.99,
    'Standard service package',
    id
FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO pricebook_entries (name, price, description, user_id)
SELECT 
    'Premium Service',
    199.99,
    'Premium service package with additional features',
    id
FROM auth.users WHERE email = 'admin@admin.com';

-- Sample data for regular user
-- Sample customers
INSERT INTO customers ("Names", "Address1", "City", "State", "PostalCode", "CombinedAddress", user_id, "uploadId")
SELECT 
    'John Smith',
    '123 Main St',
    'Anytown',
    'CA',
    '12345',
    '123 Main St, Anytown, CA 12345',
    id,
    'manual-entry-1'
FROM auth.users WHERE email = 'user@example.com';

INSERT INTO customers ("Names", "Address1", "City", "State", "PostalCode", "CombinedAddress", user_id, "uploadId")
SELECT 
    'Jane Doe',
    '456 Oak Ave',
    'Somewhere',
    'NY',
    '67890',
    '456 Oak Ave, Somewhere, NY 67890',
    id,
    'manual-entry-2'
FROM auth.users WHERE email = 'user@example.com';

-- Sample pricebook entries for user
INSERT INTO pricebook_entries (name, price, description, user_id)
SELECT 
    'Custom Service A',
    149.99,
    'Customized service package A',
    id
FROM auth.users WHERE email = 'user@example.com';

INSERT INTO pricebook_entries (name, price, description, user_id)
SELECT 
    'Custom Service B',
    249.99,
    'Customized service package B',
    id
FROM auth.users WHERE email = 'user@example.com';

-- Sample quotes for user's customers
WITH user_data AS (
    SELECT id AS user_id FROM auth.users WHERE email = 'user@example.com'
),
customer_data AS (
    SELECT id AS customer_id 
    FROM customers c, user_data 
    WHERE c.user_id = user_data.user_id 
    LIMIT 1
),
template_data AS (
    SELECT id AS template_id 
    FROM templates 
    WHERE name = 'Default Quote Template' 
    LIMIT 1
)
INSERT INTO quotes (customer_id, template_id, content, user_id)
SELECT 
    customer_data.customer_id,
    template_data.template_id,
    'Customized quote content for basic service package',
    user_data.user_id
FROM user_data, customer_data, template_data;

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

-- Enable RLS for OUTPUT table
ALTER TABLE OUTPUT ENABLE ROW LEVEL SECURITY;

-- Create policies for OUTPUT table
CREATE POLICY "Admin full access to output"
ON OUTPUT
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

CREATE POLICY "Users access own output through customers"
ON OUTPUT
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = OUTPUT.customer_id
        AND customers.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = OUTPUT.customer_id
        AND customers.user_id = auth.uid()
    )
);

-- Grant permissions
GRANT ALL ON OUTPUT TO authenticated;
  