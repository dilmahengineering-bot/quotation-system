const { sequelize } = require('../config/database');
const models = require('../models');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✓ Database schema created');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await models.User.create({
      username: 'admin',
      email: 'admin@qms.com',
      password: adminPassword,
      full_name: 'System Administrator',
      user_level: 'admin',
      is_active: true
    });
    console.log('✓ Admin user created (username: admin, password: admin123)');

    // Create sample machines
    const machines = [
      { machine_name: 'CNC Mill - VMC 500', machine_type: 'Milling', hourly_rate: 45.00, description: '3-axis vertical machining center' },
      { machine_name: 'CNC Lathe - TL200', machine_type: 'Turning', hourly_rate: 40.00, description: '2-axis CNC turning center' },
      { machine_name: 'EDM Machine - ED350', machine_type: 'EDM', hourly_rate: 65.00, description: 'Electric discharge machine' },
      { machine_name: 'Wire EDM - WED250', machine_type: 'WEDM', hourly_rate: 70.00, description: 'Wire electric discharge machine' },
      { machine_name: 'Surface Grinder - SG400', machine_type: 'Grinding', hourly_rate: 35.00, description: 'Precision surface grinder' }
    ];

    for (const machine of machines) {
      await models.Machine.create({ ...machine, created_by: 1 });
    }
    console.log('✓ Sample machines created');

    // Create sample customers
    const customers = [
      {
        company_name: 'Acme Manufacturing Inc.',
        address: '123 Industrial Park, Tech City, CA 94000',
        contact_person_name: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '+1-555-0100',
        vat_number: 'US123456789',
        created_by: 1
      },
      {
        company_name: 'Global Parts Ltd.',
        address: '456 Export Zone, Business District, NY 10001',
        contact_person_name: 'Sarah Johnson',
        email: 'sarah.j@globalparts.com',
        phone: '+1-555-0200',
        vat_number: 'US987654321',
        created_by: 1
      }
    ];

    for (const customer of customers) {
      await models.Customer.create(customer);
    }
    console.log('✓ Sample customers created');

    // Create sample auxiliary costs
    const auxiliaryCosts = [
      { aux_type: 'Setup Cost', description: 'Machine setup and preparation', default_cost: 50.00, created_by: 1 },
      { aux_type: 'Inspection', description: 'Quality control inspection', default_cost: 30.00, created_by: 1 },
      { aux_type: 'Tooling', description: 'Special tooling cost', default_cost: 100.00, created_by: 1 },
      { aux_type: 'Packaging', description: 'Custom packaging', default_cost: 25.00, created_by: 1 },
      { aux_type: 'Transportation', description: 'Internal logistics', default_cost: 40.00, created_by: 1 }
    ];

    for (const auxCost of auxiliaryCosts) {
      await models.AuxiliaryCost.create(auxCost);
    }
    console.log('✓ Sample auxiliary costs created');

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
