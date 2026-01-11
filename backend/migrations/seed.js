require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const adminResult = await db.query(`
      INSERT INTO users (full_name, username, password_hash, role, email)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
      RETURNING user_id
    `, ['System Administrator', 'admin', passwordHash, 'admin', 'admin@company.com']);

    const adminId = adminResult.rows[0]?.user_id;
    console.log('✅ Admin user created');

    // Create sample users for each role
    const users = [
      ['John Sales', 'john.sales', 'sales', 'john.sales@company.com'],
      ['Jane Engineer', 'jane.engineer', 'engineer', 'jane.engineer@company.com'],
      ['Mike Manager', 'mike.manager', 'management', 'mike.manager@company.com'],
      ['Tech Support', 'tech.support', 'technician', 'tech.support@company.com']
    ];

    for (const [name, username, role, email] of users) {
      const hash = await bcrypt.hash('password123', 12);
      await db.query(`
        INSERT INTO users (full_name, username, password_hash, role, email)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
      `, [name, username, hash, role, email]);
    }
    console.log('✅ Sample users created');

    // Create sample machines
    const machines = [
      ['CNC Milling Center', 'Milling', 85.00, 'High precision 5-axis milling machine'],
      ['CNC Lathe', 'Turning', 65.00, 'CNC turning center with live tooling'],
      ['Wire EDM', 'WEDM', 95.00, 'High precision wire EDM machine'],
      ['Sinker EDM', 'EDM', 90.00, 'Die sinking EDM machine'],
      ['Surface Grinder', 'Grinding', 55.00, 'Precision surface grinding machine'],
      ['CNC Drilling', 'Drilling', 45.00, 'Multi-spindle CNC drilling machine'],
      ['Fiber Laser', 'Laser', 120.00, 'Fiber laser cutting machine'],
      ['TIG Welder', 'Welding', 40.00, 'TIG welding station']
    ];

    for (const [name, type, rate, desc] of machines) {
      await db.query(`
        INSERT INTO machines (machine_name, machine_type, hourly_rate)
        VALUES ($1, $2, $3)
        ON CONFLICT (machine_name) DO NOTHING
      `, [name, type, rate]);
    }
    console.log('✅ Machines created');

    // Create auxiliary cost types
    const auxCosts = [
      ['Setup', 'Machine setup and calibration', 50.00],
      ['Inspection', 'Quality inspection and measurement', 35.00],
      ['Tooling', 'Special tooling and fixtures', 75.00],
      ['Programming', 'CNC programming and CAM setup', 60.00],
      ['Transport', 'Internal material handling', 25.00],
      ['Packaging', 'Special packaging requirements', 30.00],
      ['Heat Treatment', 'Heat treatment services', 100.00],
      ['Surface Finish', 'Surface finishing and coating', 80.00],
      ['Documentation', 'Technical documentation', 20.00],
      ['Testing', 'Functional testing and validation', 45.00]
    ];

    for (const [type, desc, cost] of auxCosts) {
      await db.query(`
        INSERT INTO auxiliary_costs (aux_type, description, default_cost)
        VALUES ($1, $2, $3)
        ON CONFLICT (aux_type) DO NOTHING
      `, [type, desc, cost]);
    }
    console.log('✅ Auxiliary costs created');

    // Create sample customers
    const customers = [
      ['Precision Engineering Ltd', '123 Industrial Ave, Manufacturing City', 'Robert Smith', 'robert@precision-eng.com', '+1-555-0101', 'VAT123456'],
      ['Global Manufacturing Inc', '456 Factory Road, Tech Park', 'Sarah Johnson', 'sarah@globalmanuf.com', '+1-555-0102', 'VAT789012'],
      ['Advanced Tooling Co', '789 Workshop Street, Industrial Zone', 'Michael Brown', 'michael@advtooling.com', '+1-555-0103', 'VAT345678'],
      ['Quality Parts Ltd', '321 Engineering Lane, Business District', 'Emily Davis', 'emily@qualityparts.com', '+1-555-0104', 'VAT901234'],
      ['Tech Solutions Corp', '654 Innovation Blvd, Science Park', 'David Wilson', 'david@techsolutions.com', '+1-555-0105', 'VAT567890']
    ];

    for (const [company, address, contact, email, phone, vat] of customers) {
      await db.query(`
        INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (company_name, email) DO NOTHING
      `, [company, address, contact, email, phone, vat]);
    }
    console.log('✅ Customers created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Default Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Sales: john.sales / password123');
    console.log('   Engineer: jane.engineer / password123');
    console.log('   Management: mike.manager / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
