require('dotenv').config();
const quotationController = require('./controllers/quotationController');
const pool = require('./config/database');

console.log('🧪 TESTING QUOTATION CREATION\n');
console.log('═══════════════════════════════════════════════════════════════\n');

async function testQuotationCreation() {
  const results = { passed: 0, failed: 0 };
  
  const test = (name, condition, details = '') => {
    if (condition) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
      results.failed++;
    }
  };

  try {
    // Get test data
    console.log('📋 Fetching test data...\n');
    
    const customers = await pool.query('SELECT customer_id FROM customers WHERE is_active = true LIMIT 1');
    const machines = await pool.query('SELECT machine_id, hourly_rate FROM machines WHERE is_active = true LIMIT 2');
    const auxCosts = await pool.query('SELECT aux_type_id, default_cost FROM auxiliary_costs WHERE is_active = true LIMIT 2');
    
    test('Test customer available', customers.rows.length > 0);
    test('Test machines available', machines.rows.length >= 2);
    test('Test auxiliary costs available', auxCosts.rows.length >= 2);
    
    if (customers.rows.length === 0 || machines.rows.length < 2) {
      console.log('\n❌ Insufficient test data. Run seed script first.');
      process.exit(1);
    }
    
    const customerId = customers.rows[0].customer_id;
    const machine1 = machines.rows[0];
    const machine2 = machines.rows[1];
    const aux1 = auxCosts.rows[0];
    const aux2 = auxCosts.rows[1];
    
    console.log(`\nTest Data:`);
    console.log(`  Customer ID: ${customerId}`);
    console.log(`  Machine 1: ID=${machine1.machine_id}, Rate=$${machine1.hourly_rate}/hr`);
    console.log(`  Machine 2: ID=${machine2.machine_id}, Rate=$${machine2.hourly_rate}/hr`);
    console.log(`  Aux Cost 1: ID=${aux1.aux_type_id}, Cost=$${aux1.default_cost}`);
    console.log(`  Aux Cost 2: ID=${aux2.aux_type_id}, Cost=$${aux2.default_cost}\n`);
    
    // Create test quotation payload
    const quotationData = {
      customer_id: customerId,
      quotation_date: new Date().toISOString().split('T')[0],
      lead_time: '14 days',
      payment_terms: 'Net 30',
      currency: 'USD',
      shipment_type: 'Standard',
      discount_percent: 5,
      margin_percent: 15,
      vat_percent: 12,
      notes: 'Test quotation created by automated test',
      parts: [
        {
          part_number: 'TEST-001',
          part_description: 'Test Part 1 - Bracket Assembly',
          unit_material_cost: 25.50,
          quantity: 10,
          operations: [
            {
              machine_id: machine1.machine_id,
              operation_time_hours: 2.5
            },
            {
              machine_id: machine2.machine_id,
              operation_time_hours: 1.5
            }
          ],
          auxiliary_costs: [
            {
              aux_type_id: aux1.aux_type_id,
              cost: aux1.default_cost
            }
          ]
        },
        {
          part_number: 'TEST-002',
          part_description: 'Test Part 2 - Housing Component',
          unit_material_cost: 45.00,
          quantity: 5,
          operations: [
            {
              machine_id: machine1.machine_id,
              operation_time_hours: 3.0
            }
          ],
          auxiliary_costs: [
            {
              aux_type_id: aux2.aux_type_id,
              cost: aux2.default_cost
            }
          ]
        }
      ]
    };
    
    console.log('🔨 Creating test quotation...\n');
    
    // Simulate controller request
    let createdQuotation = null;
    const req = { body: quotationData };
    const res = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) {
            createdQuotation = data;
            console.log('✅ Quotation created with status 201\n');
          } else {
            console.log(`❌ Failed with status ${code}:`, data);
          }
        }
      }),
      json: (data) => {
        createdQuotation = data;
        console.log('✅ Quotation created successfully\n');
      }
    };
    
    await quotationController.create(req, res);
    
    test('Quotation created successfully', !!createdQuotation);
    
    if (createdQuotation) {
      console.log('📊 Created Quotation Details:\n');
      console.log(`  Quote Number: ${createdQuotation.quote_number || 'N/A'}`);
      console.log(`  Quotation ID: ${createdQuotation.quotation_id}`);
      console.log(`  Customer ID: ${createdQuotation.customer_id}`);
      console.log(`  Status: ${createdQuotation.status || 'draft'}`);
      console.log(`  Currency: ${createdQuotation.currency}`);
      console.log(`  Parts Count: ${createdQuotation.parts?.length || 0}\n`);
      
      // Verify quotation structure
      test('Quotation has ID', !!createdQuotation.quotation_id);
      test('Quotation has quote number', !!createdQuotation.quote_number);
      test('Quotation has customer ID', createdQuotation.customer_id === customerId);
      test('Quotation has parts', Array.isArray(createdQuotation.parts) && createdQuotation.parts.length === 2);
      
      if (createdQuotation.parts && createdQuotation.parts.length > 0) {
        const part1 = createdQuotation.parts[0];
        console.log('📦 Part 1 Details:');
        console.log(`  Part Number: ${part1.part_number}`);
        console.log(`  Description: ${part1.part_description}`);
        console.log(`  Material Cost: $${part1.unit_material_cost}`);
        console.log(`  Operations Cost: $${part1.unit_operations_cost || 0}`);
        console.log(`  Auxiliary Cost: $${part1.unit_auxiliary_cost || 0}`);
        console.log(`  Quantity: ${part1.quantity}`);
        console.log(`  Subtotal: $${part1.part_subtotal || 0}\n`);
        
        test('Part has operations cost calculated', part1.unit_operations_cost > 0);
        test('Part has auxiliary cost', part1.unit_auxiliary_cost > 0);
        test('Part has subtotal calculated', part1.part_subtotal > 0);
        test('Part has operations', Array.isArray(part1.operations) && part1.operations.length > 0);
        
        // Calculate expected operation cost for verification
        const expectedOpCost1 = parseFloat(machine1.hourly_rate) * 2.5;
        const expectedOpCost2 = parseFloat(machine2.hourly_rate) * 1.5;
        const expectedTotalOpCost = expectedOpCost1 + expectedOpCost2;
        const actualOpCost = parseFloat(part1.unit_operations_cost);
        
        console.log('🧮 Calculation Verification:');
        console.log(`  Expected Operation Cost: $${expectedTotalOpCost.toFixed(2)}`);
        console.log(`  Actual Operation Cost: $${actualOpCost.toFixed(2)}`);
        test('Operation cost calculation correct', Math.abs(actualOpCost - expectedTotalOpCost) < 0.01);
      }
      
      // Verify quotation totals
      if (createdQuotation.total_quote_value !== undefined) {
        console.log('\n💰 Quotation Totals:');
        console.log(`  Subtotal: $${createdQuotation.subtotal || 0}`);
        console.log(`  Discount (${quotationData.discount_percent}%): -$${createdQuotation.discount_amount || 0}`);
        console.log(`  Margin (${quotationData.margin_percent}%): +$${createdQuotation.margin_amount || 0}`);
        console.log(`  VAT (${quotationData.vat_percent}%): +$${createdQuotation.vat_amount || 0}`);
        console.log(`  Total Quote Value: $${createdQuotation.total_quote_value}\n`);
        
        test('Quotation has subtotal', createdQuotation.subtotal > 0);
        test('Quotation has discount calculated', createdQuotation.discount_amount >= 0);
        test('Quotation has margin calculated', createdQuotation.margin_amount > 0);
        test('Quotation has VAT calculated', createdQuotation.vat_amount >= 0);
        test('Total quote value calculated', createdQuotation.total_quote_value > 0);
      }
      
      // Verify in database
      console.log('🔍 Verifying in database...\n');
      const dbCheck = await pool.query('SELECT * FROM quotations WHERE quotation_id = $1', [createdQuotation.quotation_id]);
      test('Quotation exists in database', dbCheck.rows.length === 1);
      
      if (dbCheck.rows.length === 1) {
        const dbQuotation = dbCheck.rows[0];
        test('Database has correct customer', dbQuotation.customer_id === customerId);
        test('Database has correct currency', dbQuotation.currency === 'USD');
        test('Database has correct discount %', parseFloat(dbQuotation.discount_percent) === 5);
        test('Database has correct margin %', parseFloat(dbQuotation.margin_percent) === 15);
        test('Database has correct VAT %', parseFloat(dbQuotation.vat_percent) === 12);
      }
      
      // Check parts in database
      const partsCheck = await pool.query('SELECT * FROM quotation_parts WHERE quotation_id = $1', [createdQuotation.quotation_id]);
      test('Parts saved to database', partsCheck.rows.length === 2);
      
      if (partsCheck.rows.length > 0) {
        const dbPart = partsCheck.rows[0];
        
        // Check operations
        const opsCheck = await pool.query('SELECT * FROM part_operations WHERE part_id = $1', [dbPart.part_id]);
        test('Operations saved to database', opsCheck.rows.length > 0);
        
        // Check auxiliary costs
        const auxCheck = await pool.query('SELECT * FROM part_auxiliary_costs WHERE part_id = $1', [dbPart.part_id]);
        test('Auxiliary costs saved to database', auxCheck.rows.length > 0);
      }
      
      // Cleanup - Delete test quotation
      console.log('\n🧹 Cleaning up test data...');
      await pool.query('DELETE FROM quotations WHERE quotation_id = $1', [createdQuotation.quotation_id]);
      const cleanupCheck = await pool.query('SELECT * FROM quotations WHERE quotation_id = $1', [createdQuotation.quotation_id]);
      test('Test quotation deleted', cleanupCheck.rows.length === 0);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    results.failed++;
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log(`📊 TEST RESULTS: ${results.passed} passed, ${results.failed} failed`);
  console.log(`   Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  process.exit(results.failed > 0 ? 1 : 0);
}

testQuotationCreation();
