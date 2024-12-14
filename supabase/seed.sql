-- Create tables for stores
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  property_type TEXT,
  property_size TEXT,
  year_built TEXT,
  upload_id TEXT,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pricebook_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT,
  upload_id TEXT,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES public.customers(id),
  status TEXT CHECK (status IN ('active', 'converted', 'lost')) DEFAULT 'active',
  service TEXT,
  total DECIMAL(10,2),
  template_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  property_details JSONB
);

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  preview_image TEXT,
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  hvac_zone_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS Policies

-- Customers policies
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  USING (user_id = auth.uid());

-- Pricebook policies
CREATE POLICY "Users can view own pricebook entries"
  ON public.pricebook_entries
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can insert own pricebook entries"
  ON public.pricebook_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pricebook entries"
  ON public.pricebook_entries
  FOR UPDATE
  USING (user_id = auth.uid());

-- Quotes policies
CREATE POLICY "Users can view own quotes"
  ON public.quotes
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can insert own quotes"
  ON public.quotes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quotes"
  ON public.quotes
  FOR UPDATE
  USING (user_id = auth.uid());

-- Templates policies
CREATE POLICY "Users can view own templates"
  ON public.templates
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can insert own templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON public.templates
  FOR UPDATE
  USING (user_id = auth.uid());

-- Settings policies
CREATE POLICY "Users can view own settings"
  ON public.settings
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can insert own settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON public.settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Insert dummy data - all assigned to the regular user
-- Note: Replace this UUID with your actual regular user's UUID from auth.users
INSERT INTO public.customers (
  user_id, name, email, address, city, state, property_type, property_size, year_built, upload_id
)
SELECT
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'user' LIMIT 1), -- Get the regular user's ID
  'Customer ' || i,
  'customer' || i || '@example.com',
  (1000 + i)::text || ' Main St',
  'Springfield',
  'IL',
  'Single Family',
  '2,500 sqft',
  '1995',
  '1'
FROM generate_series(1, 156) i;

-- Insert dummy pricebook entries
INSERT INTO public.pricebook_entries (
  user_id, sku, name, category, price, unit, upload_id
)
SELECT
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'user' LIMIT 1), -- Get the regular user's ID
  'SKU' || (1000 + i),
  'Product ' || i,
  CASE (i % 3)
    WHEN 0 THEN 'HVAC'
    WHEN 1 THEN 'Plumbing'
    ELSE 'Electrical'
  END,
  (50 + i * 2.5) * 100,
  CASE (i % 3)
    WHEN 0 THEN 'each'
    WHEN 1 THEN 'hour'
    ELSE 'ft'
  END,
  '1'
FROM generate_series(1, 245) i;

-- Insert dummy quotes
INSERT INTO public.quotes (
  user_id,
  customer_id,
  status,
  service,
  total,
  template_id,
  property_details
)
SELECT
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'user' LIMIT 1), -- Get the regular user's ID
  (SELECT id FROM public.customers ORDER BY random() LIMIT 1),
  CASE (i % 3)
    WHEN 0 THEN 'active'
    WHEN 1 THEN 'converted'
    ELSE 'lost'
  END,
  CASE (i % 3)
    WHEN 0 THEN 'Roof Replacement'
    WHEN 1 THEN 'Solar Installation'
    ELSE 'HVAC Replacement'
  END,
  (8000 + (random() * 12000))::numeric(10,2),
  'default-template',
  jsonb_build_object(
    'address', jsonb_build_object(
      'streetAddress', (1000 + i)::text || ' Oak Street',
      'city', 'Springfield',
      'state', 'IL'
    ),
    'type', 'Single Family',
    'size', '2,800 sqft',
    'yearBuilt', '1995',
    'bedrooms', '4',
    'bathrooms', '2.5'
  )
FROM generate_series(1, 50) i;

-- Insert default template
INSERT INTO public.templates (
  user_id,
  name,
  description,
  is_default,
  preview_image,
  sections
)
VALUES (
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'user' LIMIT 1), -- Get the regular user's ID
  'Professional Roofing Template',
  'A comprehensive template for roofing services with team profiles and certifications',
  true,
  'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
  '[
    {
      "id": "header",
      "type": "header",
      "title": "Customer Approval",
      "content": "",
      "order": 1,
      "images": [
        {
          "id": "truck-image",
          "url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=400&fit=crop",
          "alt": "Company Truck",
          "width": 800,
          "height": 400
        }
      ],
      "settings": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "layout": "left"
      }
    }
  ]'::jsonb
);

-- Insert default settings
INSERT INTO public.settings (
  user_id,
  hvac_zone_rules
)
VALUES (
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'user' LIMIT 1), -- Get the regular user's ID
  '{
    "baseZones": 1,
    "sizeThresholds": {
      "medium": 2500,
      "large": 4000
    },
    "maxZones": 4,
    "bathroomThreshold": 2.5
  }'::jsonb
); 