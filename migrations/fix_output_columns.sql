-- Fix the output table columns
BEGIN;

-- First, rename existing columns if they exist (safe operation)
ALTER TABLE output 
  RENAME COLUMN propertytype TO property_type;

ALTER TABLE output 
  RENAME COLUMN propertysize TO property_size;

ALTER TABLE output 
  RENAME COLUMN yearbuilt TO year_built;

ALTER TABLE output 
  RENAME COLUMN lotsize TO lot_size;

-- Add any missing columns (safe operation)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE output ADD COLUMN property_type text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE output ADD COLUMN property_size text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE output ADD COLUMN year_built text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE output ADD COLUMN lot_size text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE output ADD COLUMN bedrooms integer;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE output ADD COLUMN bathrooms integer;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Add primary key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'output' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE output ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Add unique constraint on customer_id if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'output' AND constraint_name = 'output_customer_id_key'
    ) THEN
        ALTER TABLE output ADD UNIQUE (customer_id);
    END IF;
END $$;

COMMIT; 