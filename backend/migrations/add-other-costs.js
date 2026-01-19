require('dotenv').config();
const db = require('../config/database');

const addOtherCostsMigration = `
-- Enable UUID extension if not exists (may not be needed if using serial IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- OTHER COSTS TABLE (Overhead Costs)
-- =====================================================
CREATE TABLE IF NOT EXISTS other_costs (
    other_cost_id SERIAL PRIMARY KEY,
    cost_type VARCHAR(100) NOT NULL,
    description TEXT,
    default_rate DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (default_rate >= 0),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id),
    updated_by INTEGER REFERENCES users(user_id)
);

-- =====================================================
-- QUOTATION OTHER COSTS TABLE (per quotation)
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_other_costs (
    quotation_other_cost_id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    other_cost_id INTEGER NOT NULL REFERENCES other_costs(other_cost_id),
    quantity DECIMAL(10, 4) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    rate_per_hour DECIMAL(10, 2) NOT NULL CHECK (rate_per_hour >= 0),
    cost DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ALTER QUOTATIONS TABLE - ADD OTHER COST COLUMNS
-- =====================================================
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS total_other_cost DECIMAL(12, 2) DEFAULT 0;

-- Update the comment for documentation
COMMENT ON COLUMN quotations.total_other_cost IS 'Sum of all other costs (Salary, R&M, Rent, Insurance, etc.)';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_quotation_other_costs_quotation ON quotation_other_costs(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_other_costs_other_cost ON quotation_other_costs(other_cost_id);
CREATE INDEX IF NOT EXISTS idx_other_costs_active ON other_costs(is_active);

-- =====================================================
-- INSERT DEFAULT OTHER COSTS
-- =====================================================
INSERT INTO other_costs (cost_type, description, default_rate, sort_order) VALUES
('Salary Cost - Technician', 'Technician salary cost per hour', 308.99, 1),
('Salary Cost - Admin', 'Administrative staff salary cost per hour', 890.81, 2),
('Repair and Maintenance', 'Equipment repair and maintenance cost per hour', 208.33, 3),
('Rent', 'Facility rent cost per hour', 121.14, 4),
('Insurance', 'Insurance cost per hour', 12.50, 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION TO CALCULATE QUOTATION OTHER COSTS
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_quotation_other_costs(p_quotation_id INTEGER)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    total_other_cost DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(cost), 0)
    INTO total_other_cost
    FROM quotation_other_costs
    WHERE quotation_id = p_quotation_id;
    
    RETURN total_other_cost;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO UPDATE TOTAL ON OTHER COST CHANGES
-- =====================================================
CREATE OR REPLACE FUNCTION update_quotation_other_costs()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate cost
    NEW.cost = NEW.quantity * NEW.rate_per_hour;
    
    -- Update quotation total_other_cost
    UPDATE quotations
    SET total_other_cost = calculate_quotation_other_costs(NEW.quotation_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE quotation_id = NEW.quotation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_quotation_other_costs
BEFORE INSERT OR UPDATE ON quotation_other_costs
FOR EACH ROW
EXECUTE FUNCTION update_quotation_other_costs();

-- =====================================================
-- TRIGGER TO UPDATE TOTAL ON OTHER COST DELETE
-- =====================================================
CREATE OR REPLACE FUNCTION update_quotation_other_costs_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update quotation total_other_cost
    UPDATE quotations
    SET total_other_cost = calculate_quotation_other_costs(OLD.quotation_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE quotation_id = OLD.quotation_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_quotation_other_costs_delete
AFTER DELETE ON quotation_other_costs
FOR EACH ROW
EXECUTE FUNCTION update_quotation_other_costs_on_delete();

-- =====================================================
-- UPDATE EXISTING QUOTATIONS WITH DEFAULT VALUE
-- =====================================================
UPDATE quotations 
SET total_other_cost = 0 
WHERE total_other_cost IS NULL;
`;

async function runMigration() {
  const client = await db.connect();
  try {
    console.log('🚀 Starting Other Costs migration...');
    await client.query('BEGIN');
    await client.query(addOtherCostsMigration);
    await client.query('COMMIT');
    console.log('✅ Other Costs migration completed successfully!');
    console.log('📊 Added tables: other_costs, quotation_other_costs');
    console.log('📊 Added 5 default other cost types');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
