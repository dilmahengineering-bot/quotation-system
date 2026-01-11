-- Migration: Add default_cost, quantity, and notes to part_auxiliary_costs
-- Date: 2026-01-11
-- Purpose: Support new auxiliary cost calculation (default_cost × quantity)

-- Step 1: Add new columns
ALTER TABLE part_auxiliary_costs 
ADD COLUMN IF NOT EXISTS default_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 2: Migrate existing data (copy cost to default_cost, set quantity to 1)
UPDATE part_auxiliary_costs 
SET default_cost = cost, 
    quantity = 1 
WHERE default_cost IS NULL;

-- Step 3: Make default_cost NOT NULL after migration
ALTER TABLE part_auxiliary_costs 
ALTER COLUMN default_cost SET NOT NULL,
ALTER COLUMN default_cost SET DEFAULT 0,
ALTER COLUMN quantity SET NOT NULL;

-- Step 4: Drop the old cost column (it will be replaced with a computed column)
ALTER TABLE part_auxiliary_costs DROP COLUMN IF EXISTS cost;

-- Step 5: Add cost as a computed column
ALTER TABLE part_auxiliary_costs 
ADD COLUMN cost DECIMAL(10, 2) GENERATED ALWAYS AS (default_cost * quantity) STORED;

-- Verify migration
SELECT 
    part_aux_id,
    aux_type_id,
    default_cost,
    quantity,
    cost,
    notes
FROM part_auxiliary_costs
LIMIT 5;
