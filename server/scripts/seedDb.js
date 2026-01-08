require('dotenv').config();
const pool = require('../config/database');

const seedDb = async () => {
  try {
    // Seed Machines
    const machines = [
      { name: 'CNC Mill Pro 5000', type: 'Milling', rate: 85.00 },
      { name: 'Precision Lathe X200', type: 'Turning', rate: 75.00 },
      { name: 'EDM Spark Master', type: 'EDM', rate: 120.00 },
      { name: 'Wire EDM Ultra', type: 'WEDM', rate: 150.00 },
      { name: 'Surface Grinder G400', type: 'Grinding', rate: 65.00 },
      { name: 'Multi-Axis Drill Station', type: 'Drilling', rate: 55.00 },
      { name: 'Fiber Laser Cutter 3kW', type: 'Laser', rate: 200.00 },
      { name: 'CNC Turning Center T100', type: 'Turning', rate: 90.00 }
    ];

    for (const machine of machines) {
      await pool.query(
        `INSERT INTO machines (machine_name, machine_type, hourly_rate) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [machine.name, machine.type, machine.rate]
      );
    }
    console.log('Machines seeded');

    // Seed Customers
    const customers = [
      { 
        company: 'TechParts Industries', 
        address: '123 Industrial Blvd, Detroit, MI 48201',
        contact: 'John Smith',
        email: 'john.smith@techparts.com',
        phone: '+1-555-0101',
        vat: 'US12-3456789'
      },
      { 
        company: 'Precision Manufacturing Co', 
        address: '456 Factory Lane, Cleveland, OH 44101',
        contact: 'Sarah Johnson',
        email: 'sarah.j@precisionmfg.com',
        phone: '+1-555-0102',
        vat: 'US12-9876543'
      },
      { 
        company: 'AutoParts Global', 
        address: '789 Assembly Drive, Chicago, IL 60601',
        contact: 'Michael Chen',
        email: 'm.chen@autopartsglobal.com',
        phone: '+1-555-0103',
        vat: 'US12-5555555'
      },
      { 
        company: 'Aerospace Components Ltd', 
        address: '321 Aviation Way, Seattle, WA 98101',
        contact: 'Emily Brown',
        email: 'e.brown@aerospacecomp.com',
        phone: '+1-555-0104',
        vat: 'US12-7777777'
      },
      { 
        company: 'Medical Device Solutions', 
        address: '555 Healthcare Park, Boston, MA 02101',
        contact: 'David Wilson',
        email: 'd.wilson@meddevice.com',
        phone: '+1-555-0105',
        vat: 'US12-8888888'
      }
    ];

    for (const customer of customers) {
      await pool.query(
        `INSERT INTO customers (company_name, address, contact_person_name, email, phone, vat_number) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (company_name, email) DO NOTHING`,
        [customer.company, customer.address, customer.contact, customer.email, customer.phone, customer.vat]
      );
    }
    console.log('Customers seeded');

    // Seed Auxiliary Costs
    const auxCosts = [
      { type: 'Setup', description: 'Machine setup and calibration', cost: 150.00 },
      { type: 'Inspection', description: 'Quality inspection and documentation', cost: 75.00 },
      { type: 'Transport', description: 'Shipping and handling', cost: 100.00 },
      { type: 'Tooling', description: 'Special tooling requirements', cost: 200.00 },
      { type: 'Packaging', description: 'Custom packaging materials', cost: 50.00 },
      { type: 'Documentation', description: 'Technical documentation and certificates', cost: 80.00 },
      { type: 'Heat Treatment', description: 'Post-processing heat treatment', cost: 175.00 },
      { type: 'Surface Finishing', description: 'Anodizing, plating, or coating', cost: 125.00 },
      { type: 'Rush Fee', description: 'Expedited processing surcharge', cost: 250.00 },
      { type: 'Engineering', description: 'Design review and engineering support', cost: 95.00 }
    ];

    for (const aux of auxCosts) {
      await pool.query(
        `INSERT INTO auxiliary_costs (aux_type, description, default_cost) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [aux.type, aux.description, aux.cost]
      );
    }
    console.log('Auxiliary costs seeded');

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await pool.end();
  }
};

seedDb();
