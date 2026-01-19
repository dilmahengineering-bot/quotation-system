require('dotenv').config();
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('\n🔧 Initializing Render Database...\n');

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✓ Schema created successfully\n');

    // Create default users
    console.log('👥 Creating default users...');
    const bcrypt = require('bcryptjs');
    
    const users = [
      { username: 'admin', password: 'admin123', full_name: 'System Administrator', email: 'admin@dilmah.com', role: 'admin' },
      { username: 'john.sales', password: 'sales123', full_name: 'John Sales', email: 'john.sales@dilmah.com', role: 'sales' },
      { username: 'jane.engineer', password: 'engineer123', full_name: 'Jane Engineer', email: 'jane.engineer@dilmah.com', role: 'engineer' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(
        `INSERT INTO users (username, password_hash, full_name, email, role) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (username) DO NOTHING`,
        [user.username, hashedPassword, user.full_name, user.email, user.role]
      );
      console.log(`  ✓ Created user: ${user.username} (${user.role})`);
    }

    // Create default machines
    console.log('\n🏭 Creating default machines...');
    const machines = [
      { name: 'CNC Lathe', type: 'CNC', rate: 50.00 },
      { name: 'CNC Milling', type: 'CNC', rate: 60.00 },
      { name: 'Manual Lathe', type: 'Manual', rate: 30.00 },
      { name: 'Grinding Machine', type: 'Grinding', rate: 40.00 },
      { name: 'Drilling Machine', type: 'Drilling', rate: 25.00 }
    ];

    for (const machine of machines) {
      await client.query(
        `INSERT INTO machines (machine_name, machine_type, hourly_rate) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (machine_name) DO NOTHING`,
        [machine.name, machine.type, machine.rate]
      );
      console.log(`  ✓ Created machine: ${machine.name} ($${machine.rate}/hr)`);
    }

    // Create default auxiliary costs
    console.log('\n💰 Creating default auxiliary costs...');
    const auxCosts = [
      { type: 'Packaging', description: 'Standard packaging cost', cost: 10.00 },
      { type: 'Quality Inspection', description: 'QC inspection cost', cost: 15.00 },
      { type: 'Special Tooling', description: 'Custom tooling cost', cost: 50.00 },
      { type: 'Surface Treatment', description: 'Coating/plating cost', cost: 20.00 },
      { type: 'Documentation', description: 'Technical documentation', cost: 5.00 }
    ];

    for (const aux of auxCosts) {
      await client.query(
        `INSERT INTO auxiliary_costs (aux_type, description, default_cost) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (aux_type) DO NOTHING`,
        [aux.type, aux.description, aux.cost]
      );
      console.log(`  ✓ Created aux cost: ${aux.type} ($${aux.cost})`);
    }

    // Create default customers
    console.log('\n🏢 Creating default customers...');
    const customers = [
      { 
        company: 'ABC Manufacturing Ltd', 
        address: '123 Industrial Park, Singapore',
        contact: 'John Smith',
        email: 'john@abc-mfg.com',
        phone: '+65 6123 4567',
        vat: 'SG-VAT-12345'
      },
      { 
        company: 'XYZ Industries Pte Ltd', 
        address: '456 Tech Park, Singapore',
        contact: 'Jane Doe',
        email: 'jane@xyz-ind.com',
        phone: '+65 6234 5678',
        vat: 'SG-VAT-67890'
      }
    ];

    for (const customer of customers) {
      await client.query(
        `INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (company_name, email) DO NOTHING`,
        [customer.company, customer.address, customer.contact, customer.email, customer.phone, customer.vat]
      );
      console.log(`  ✓ Created customer: ${customer.company}`);
    }

    await client.query('COMMIT');
    
    console.log('\n✅ Database initialized successfully!\n');
    console.log('Default Login Credentials:');
    console.log('  Admin:    admin / admin123');
    console.log('  Sales:    john.sales / sales123');
    console.log('  Engineer: jane.engineer / engineer123\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
