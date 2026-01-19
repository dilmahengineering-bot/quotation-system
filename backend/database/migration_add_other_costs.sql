-- Migration: Add other_costs table
-- Date: 2026-01-19

-- Create other_costs table if it doesn't exist
CREATE TABLE IF NOT EXISTS other_costs (
    other_cost_id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    cost_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    rate_per_hour DECIMAL(10, 2) DEFAULT 0,
    cost DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_other_costs_quotation ON other_costs(quotation_id);

-- Sample data for testing (optional)
-- INSERT INTO other_costs (quotation_id, cost_name, quantity, rate_per_hour, cost) VALUES
-- (1, 'Salary Cost_Technician', 10, 308.99, 3089.88),
-- (1, 'Salary Cost_Admin', 10, 890.81, 8908.12),
-- (1, 'Repair and Maintenance', 10, 208.33, 2083.33),
-- (1, 'Rent', 10, 121.14, 1211.44),
-- (1, 'Insurance', 10, 12.50, 125.00);

SELECT 'other_costs table created successfully!' as message;
