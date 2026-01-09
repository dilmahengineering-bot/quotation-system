const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://quotation_user:dOrCP3j3j78XqePUp2n8xnao1rrJFE38@dpg-d5fvgbuuk2gs7391qgl0-a.singapore-postgres.render.com/quotation_db_mxcl';

async function initializeDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Render database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('\nTables created:');
    console.log('  - machines');
    console.log('  - customers');
    console.log('  - auxiliary_costs');
    console.log('  - quotations');
    console.log('  - quotation_parts');
    console.log('  - part_operations');
    console.log('  - part_auxiliary_costs');
    console.log('\nSample data inserted!');
    console.log('\n🎉 Your app is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
