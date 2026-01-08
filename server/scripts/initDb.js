require('dotenv').config();
const { Pool } = require('pg');

const initDb = async () => {
  // Connect without database first to create it
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres'
  });

  try {
    // Check if database exists
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'quotation_db']
    );

    if (dbCheck.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'quotation_db'}`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await adminPool.end();
  }

  // Connect to the actual database to create tables
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'quotation_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  const schema = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Machine Master Table
    CREATE TABLE IF NOT EXISTS machines (
      machine_id SERIAL PRIMARY KEY,
      machine_name VARCHAR(100) NOT NULL,
      machine_type VARCHAR(50) NOT NULL CHECK (machine_type IN ('Milling', 'Turning', 'EDM', 'WEDM', 'Grinding', 'Drilling', 'Laser', 'Other')),
      hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Customer Master Table
    CREATE TABLE IF NOT EXISTS customers (
      customer_id SERIAL PRIMARY KEY,
      company_name VARCHAR(200) NOT NULL,
      address TEXT,
      contact_person_name VARCHAR(100),
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      vat_number VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_name, email)
    );

    -- Auxiliary Cost Master Table
    CREATE TABLE IF NOT EXISTS auxiliary_costs (
      aux_type_id SERIAL PRIMARY KEY,
      aux_type VARCHAR(100) NOT NULL,
      description TEXT,
      default_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (default_cost >= 0),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Quotation Header Table
    CREATE TABLE IF NOT EXISTS quotations (
      quotation_id SERIAL PRIMARY KEY,
      quotation_number VARCHAR(20) UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES customers(customer_id),
      total_parts_cost DECIMAL(12, 2) DEFAULT 0,
      total_fixed_cost DECIMAL(12, 2) DEFAULT 0,
      total_auxiliary_cost DECIMAL(12, 2) DEFAULT 0,
      subtotal DECIMAL(12, 2) DEFAULT 0,
      margin_percent DECIMAL(5, 2) DEFAULT 0 CHECK (margin_percent >= 0 AND margin_percent <= 100),
      margin_amount DECIMAL(12, 2) DEFAULT 0,
      total_quote_value DECIMAL(12, 2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
      notes TEXT,
      valid_until DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Quotation Parts Table
    CREATE TABLE IF NOT EXISTS quotation_parts (
      part_id SERIAL PRIMARY KEY,
      quotation_id INTEGER REFERENCES quotations(quotation_id) ON DELETE CASCADE,
      part_number VARCHAR(50) NOT NULL,
      part_description TEXT,
      unit_material_cost DECIMAL(10, 2) DEFAULT 0 CHECK (unit_material_cost >= 0),
      unit_operations_cost DECIMAL(10, 2) DEFAULT 0,
      unit_auxiliary_cost DECIMAL(10, 2) DEFAULT 0,
      quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
      part_subtotal DECIMAL(12, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Part Operations Table
    CREATE TABLE IF NOT EXISTS part_operations (
      operation_id SERIAL PRIMARY KEY,
      part_id INTEGER REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
      machine_id INTEGER REFERENCES machines(machine_id),
      operation_name VARCHAR(100),
      estimated_hours DECIMAL(6, 2) DEFAULT 0 CHECK (estimated_hours >= 0),
      estimated_minutes DECIMAL(4, 0) DEFAULT 0 CHECK (estimated_minutes >= 0 AND estimated_minutes < 60),
      operation_cost DECIMAL(10, 2) DEFAULT 0,
      sequence_order INTEGER DEFAULT 1,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Part Auxiliary Costs Table (many-to-many relationship)
    CREATE TABLE IF NOT EXISTS part_auxiliary_costs (
      id SERIAL PRIMARY KEY,
      part_id INTEGER REFERENCES quotation_parts(part_id) ON DELETE CASCADE,
      aux_type_id INTEGER REFERENCES auxiliary_costs(aux_type_id),
      cost DECIMAL(10, 2) DEFAULT 0 CHECK (cost >= 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
    CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
    CREATE INDEX IF NOT EXISTS idx_quotation_parts_quotation ON quotation_parts(quotation_id);
    CREATE INDEX IF NOT EXISTS idx_part_operations_part ON part_operations(part_id);
    CREATE INDEX IF NOT EXISTS idx_part_auxiliary_costs_part ON part_auxiliary_costs(part_id);

    -- Create function to update timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers for updated_at
    DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;
    CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
    CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_auxiliary_costs_updated_at ON auxiliary_costs;
    CREATE TRIGGER update_auxiliary_costs_updated_at BEFORE UPDATE ON auxiliary_costs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
    CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_quotation_parts_updated_at ON quotation_parts;
    CREATE TRIGGER update_quotation_parts_updated_at BEFORE UPDATE ON quotation_parts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_part_operations_updated_at ON part_operations;
    CREATE TRIGGER update_part_operations_updated_at BEFORE UPDATE ON part_operations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Create function to generate quotation number
    CREATE OR REPLACE FUNCTION generate_quotation_number()
    RETURNS TRIGGER AS $$
    DECLARE
      year_part VARCHAR(4);
      seq_num INTEGER;
      new_number VARCHAR(20);
    BEGIN
      year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
      SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 6) AS INTEGER)), 0) + 1
      INTO seq_num
      FROM quotations
      WHERE quotation_number LIKE 'QT-' || year_part || '-%';
      
      new_number := 'QT-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
      NEW.quotation_number := new_number;
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS set_quotation_number ON quotations;
    CREATE TRIGGER set_quotation_number BEFORE INSERT ON quotations
      FOR EACH ROW
      WHEN (NEW.quotation_number IS NULL)
      EXECUTE FUNCTION generate_quotation_number();
  `;

  try {
    await pool.query(schema);
    console.log('Database schema created successfully');
  } catch (err) {
    console.error('Error creating schema:', err.message);
  } finally {
    await pool.end();
  }
};

initDb();
