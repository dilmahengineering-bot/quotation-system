-- Database Schema for Quotation Management System

-- Machine Master Table
CREATE TABLE IF NOT EXISTS machines (
    machine_id SERIAL PRIMARY KEY,
    machine_name VARCHAR(255) NOT NULL UNIQUE,
    machine_type VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Master Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_person_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    vat_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_name, email)
);

-- Auxiliary Cost Master Table
CREATE TABLE IF NOT EXISTS auxiliary_costs (
    aux_type_id SERIAL PRIMARY KEY,
    aux_type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    default_cost DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotation Header Table
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id SERIAL PRIMARY KEY,
    quote_number VARCHAR(10) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(customer_id),
    quotation_date DATE NOT NULL,
    lead_time VARCHAR(100),
    payment_terms TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    shipment_type VARCHAR(100),
    total_parts_cost DECIMAL(15, 2) DEFAULT 0,
    total_fixed_cost DECIMAL(15, 2) DEFAULT 0,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    margin_percent DECIMAL(5, 2) DEFAULT 0,
    margin_amount DECIMAL(15, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 0,
    vat_amount DECIMAL(15, 2) DEFAULT 0,
    total_quote_value DECIMAL(15, 2) DEFAULT 0,
    quotation_status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotation Parts Table
CREATE TABLE IF NOT EXISTS quotation_parts (
    part_id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    part_number VARCHAR(255) NOT NULL,
    part_description TEXT,
    unit_material_cost DECIMAL(10, 2) DEFAULT 0,
    unit_operations_cost DECIMAL(10, 2) DEFAULT 0,
    unit_auxiliary_cost DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    part_subtotal DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Part Operations Table
CREATE TABLE IF NOT EXISTS part_operations (
    operation_id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
    machine_id INTEGER REFERENCES machines(machine_id),
    operation_time_hours DECIMAL(10, 2) NOT NULL,
    operation_cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Part Auxiliary Costs Table
CREATE TABLE IF NOT EXISTS part_auxiliary_costs (
    part_aux_id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
    aux_type_id INTEGER REFERENCES auxiliary_costs(aux_type_id),
    cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(quotation_status);
CREATE INDEX idx_quotation_parts_quotation ON quotation_parts(quotation_id);
CREATE INDEX idx_part_operations_part ON part_operations(part_id);
CREATE INDEX idx_part_auxiliary_costs_part ON part_auxiliary_costs(part_id);

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM quotations;
    
    new_number := 'QT' || LPAD(counter::TEXT, 8, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample machines
INSERT INTO machines (machine_name, machine_type, hourly_rate) VALUES
    ('CNC Mill 1', 'Milling', 75.00),
    ('CNC Lathe 1', 'Turning', 65.00),
    ('EDM Machine 1', 'EDM', 90.00),
    ('WEDM Machine 1', 'WEDM', 85.00),
    ('Grinder 1', 'Grinding', 55.00)
ON CONFLICT (machine_name) DO NOTHING;

-- Insert sample auxiliary costs
INSERT INTO auxiliary_costs (aux_type, description, default_cost) VALUES
    ('Setup Cost', 'Machine setup and preparation', 50.00),
    ('Inspection', 'Quality inspection cost', 30.00),
    ('Tooling', 'Special tooling cost', 100.00),
    ('Transport', 'Internal transport cost', 25.00),
    ('Packaging', 'Packaging and labeling', 20.00)
ON CONFLICT (aux_type) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number) VALUES
    ('ABC Manufacturing Ltd', '123 Industrial Ave, City', 'John Smith', 'john@abcmfg.com', '+1-555-0100', 'VAT123456'),
    ('XYZ Engineering Corp', '456 Tech Park, Town', 'Jane Doe', 'jane@xyzeng.com', '+1-555-0200', 'VAT789012')
ON CONFLICT (company_name, email) DO NOTHING;
