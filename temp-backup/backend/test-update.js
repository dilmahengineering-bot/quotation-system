const axios = require('axios');

async function testQuotationUpdate() {
  try {
    console.log('🧪 Testing Quotation Update Functionality...\n');

    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully\n');

    // Get existing quotations
    const quotationsRes = await axios.get('http://localhost:5000/api/quotations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const draftQuotations = quotationsRes.data.filter(q => 
      q.quotation_status?.toLowerCase() === 'draft'
    );

    if (draftQuotations.length === 0) {
      console.log('⚠️  No draft quotations found to test update');
      console.log('   Creating a new test quotation first...\n');
      
      // Create a test quotation
      const createPayload = {
        customer_id: 1,
        quotation_date: new Date().toISOString().split('T')[0],
        lead_time: '2 weeks',
        payment_terms: 'Net 30',
        currency: 'USD',
        shipment_type: 'Air',
        discount_percent: 5,
        margin_percent: 15,
        vat_percent: 12,
        parts: [{
          part_number: 'TEST-001',
          part_description: 'Test Part for Update',
          unit_material_cost: 100,
          quantity: 2,
          operations: [{
            machine_id: 1,
            operation_time_hours: 1.5
          }],
          auxiliary_costs: [{
            aux_type_id: 1,
            cost: 20,
            notes: 'Test auxiliary cost'
          }]
        }]
      };

      const createRes = await axios.post('http://localhost:5000/api/quotations', createPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Created test quotation: ${createRes.data.quote_number}\n`);
      var testQuotation = createRes.data;
    } else {
      var testQuotation = draftQuotations[0];
      console.log(`📋 Found draft quotation: ${testQuotation.quote_number}\n`);
    }

    // Get full quotation details
    const detailRes = await axios.get(
      `http://localhost:5000/api/quotations/${testQuotation.quotation_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const quotation = detailRes.data;
    console.log('Original Values:');
    console.log(`  Lead Time: ${quotation.lead_time}`);
    console.log(`  Parts: ${quotation.parts?.length || 0}`);
    console.log(`  Total Value: ${quotation.total_quote_value}\n`);

    // Update the quotation
    console.log('🔄 Updating quotation...');
    const updatePayload = {
      customer_id: quotation.customer_id,
      quotation_date: quotation.quotation_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      lead_time: '3 weeks (UPDATED)',
      payment_terms: 'Net 45 (UPDATED)',
      currency: quotation.currency,
      shipment_type: 'Sea (UPDATED)',
      discount_percent: 10, // Changed from 5
      margin_percent: 20,   // Changed from 15
      vat_percent: 15,      // Changed from 12
      parts: [{
        part_number: 'UPDATED-001',
        part_description: 'Updated Test Part',
        unit_material_cost: 150, // Changed from 100
        quantity: 3,            // Changed from 2
        operations: [{
          machine_id: 2,        // Changed machine
          operation_time_hours: 2.5 // Changed time
        }],
        auxiliary_costs: [{
          aux_type_id: 2,       // Changed type
          cost: 35,            // Changed cost
          notes: 'Updated auxiliary cost'
        }]
      }]
    };

    const updateRes = await axios.put(
      `http://localhost:5000/api/quotations/${testQuotation.quotation_id}`,
      updatePayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Update successful!\n');
    console.log('Updated Values:');
    console.log(`  Lead Time: ${updateRes.data.lead_time}`);
    console.log(`  Payment Terms: ${updateRes.data.payment_terms}`);
    console.log(`  Shipment Type: ${updateRes.data.shipment_type}`);
    console.log(`  Parts: ${updateRes.data.parts?.length || 0}`);
    if (updateRes.data.parts?.length > 0) {
      const part = updateRes.data.parts[0];
      console.log(`  Part Number: ${part.part_number}`);
      console.log(`  Quantity: ${part.quantity}`);
      console.log(`  Material Cost: ${part.unit_material_cost}`);
      console.log(`  Operations: ${part.operations?.length || 0}`);
      console.log(`  Aux Costs: ${part.auxiliaryCosts?.length || 0}`);
    }
    console.log(`  Total Value: ${updateRes.data.total_quote_value}\n`);

    console.log('✅ Quotation update test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testQuotationUpdate();
