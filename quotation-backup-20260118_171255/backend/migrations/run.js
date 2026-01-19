const db = require('../src/config/database');

const migrations = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Technician', 'Engineer', 'Management')),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    address TEXT,
    contact_person_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    vat_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    UNIQUE(company_name, email)
);

-- =====================================================
-- MACHINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS machines (
    machine_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_name VARCHAR(100) NOT NULL,
    machine_type VARCHAR(50) NOT NULL CHECK (machine_type IN ('Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Welding', 'Other')),
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

-- =====================================================
-- AUXILIARY COSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS auxiliary_costs (
    aux_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aux_type VARCHAR(50) NOT NULL,
    description TEXT,
    default_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (default_cost >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

-- =====================================================
-- QUOTATIONS TABLE (Header)
-- =====================================================
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(customer_id),
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lead_time VARCHAR(50),
    payment_terms VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'LKR')),
    shipment_type VARCHAR(50),
    total_parts_cost DECIMAL(12, 2) DEFAULT 0,
    total_auxiliary_cost DECIMAL(12, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    margin_percent DECIMAL(5, 2) DEFAULT 0 CHECK (margin_percent >= 0 AND margin_percent <= 100),
    margin_amount DECIMAL(12, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 0 CHECK (vat_percent >= 0 AND vat_percent <= 100),
    vat_amount DECIMAL(12, 2) DEFAULT 0,
    total_quote_value DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Engineer Approved', 'Management Approved', 'Rejected', 'Issued')),
    notes TEXT,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id)
);

-- =====================================================
-- QUOTATION PARTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_parts (
    part_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    part_number VARCHAR(50) NOT NULL,
    part_description TEXT,
    unit_material_cost DECIMAL(10, 2) DEFAULT 0 CHECK (unit_material_cost >= 0),
    unit_operations_cost DECIMAL(10, 2) DEFAULT 0,
    unit_auxiliary_cost DECIMAL(10, 2) DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    part_subtotal DECIMAL(12, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PART OPERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS part_operations (
    operation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(machine_id),
    operation_name VARCHAR(100),
    estimated_time_hours DECIMAL(8, 4) NOT NULL DEFAULT 0 CHECK (estimated_time_hours >= 0),
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    operation_cost DECIMAL(10, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PART AUXILIARY COSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS part_auxiliary_costs (
    part_aux_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
    aux_type_id UUID NOT NULL REFERENCES auxiliary_costs(aux_type_id),
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- QUOTATION AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(quotation_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_fields JSONB,
    comments TEXT,
    performed_by UUID REFERENCES users(user_id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quote_date);
CREATE INDEX IF NOT EXISTS idx_quotations_quote_number ON quotations(quote_number);
CREATE INDEX IF NOT EXISTS idx_parts_quotation ON quotation_parts(quotation_id);
CREATE INDEX IF NOT EXISTS idx_operations_part ON part_operations(part_id);
CREATE INDEX IF NOT EXISTS idx_part_aux_part ON part_auxiliary_costs(part_id);
CREATE INDEX IF NOT EXISTS idx_audit_quotation ON quotation_audit_log(quotation_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);

-- =====================================================
-- SEQUENCE FOR QUOTE NUMBER
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START WITH 1000000001;

-- =====================================================
-- FUNCTION TO GENERATE QUOTE NUMBER
-- =====================================================
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_number VARCHAR(20);
BEGIN
    SELECT LPAD(nextval('quote_number_seq')::TEXT, 10, '0') INTO new_number;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO AUTO-SET UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
`;

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    await db.query(migrations);
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
