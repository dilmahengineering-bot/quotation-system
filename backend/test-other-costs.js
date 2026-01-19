require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOtherCosts() {
  try {
    console.log('🧪 Testing Other Costs API...\n');

    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };

    // 2. Get all other cost types
    console.log('2️⃣ Fetching other cost types...');
    const typesResponse = await axios.get(`${BASE_URL}/other-costs/types`, config);
    console.log(`✅ Found ${typesResponse.data.length} other cost types:`);
    typesResponse.data.forEach(type => {
      console.log(`   - ${type.cost_type}: Rs. ${type.default_rate}/hour`);
    });
    console.log('');

    // 3. Get quotations to test with
    console.log('3️⃣ Fetching quotations...');
    const quotationsResponse = await axios.get(`${BASE_URL}/quotations`, config);
    if (quotationsResponse.data.length === 0) {
      console.log('❌ No quotations found to test with');
      return;
    }
    const testQuotationId = quotationsResponse.data[0].quotation_id;
    console.log(`✅ Using quotation ID: ${testQuotationId}\n`);

    // 4. Add other costs to quotation
    console.log('4️⃣ Adding other costs to quotation...');
    const otherCostTypes = typesResponse.data;
    
    for (const type of otherCostTypes.slice(0, 3)) { // Add first 3 types
      const addResponse = await axios.post(
        `${BASE_URL}/quotations/${testQuotationId}/other-costs`,
        {
          other_cost_id: type.other_cost_id,
          quantity: 10, // 10 hours
          rate_per_hour: type.default_rate,
          notes: `Test ${type.cost_type}`
        },
        config
      );
      console.log(`   ✅ Added: ${type.cost_type} - Rs. ${addResponse.data.cost}`);
    }
    console.log('');

    // 5. Get other costs for quotation
    console.log('5️⃣ Fetching quotation other costs...');
    const quotationOtherCosts = await axios.get(
      `${BASE_URL}/quotations/${testQuotationId}/other-costs`,
      config
    );
    console.log(`✅ Found ${quotationOtherCosts.data.length} other costs in quotation:`);
    quotationOtherCosts.data.forEach(cost => {
      console.log(`   - ${cost.cost_type}: Qty ${cost.quantity} × Rs. ${cost.rate_per_hour} = Rs. ${cost.cost}`);
    });
    console.log('');

    // 6. Get total other costs
    console.log('6️⃣ Getting total other costs...');
    const totalResponse = await axios.get(
      `${BASE_URL}/quotations/${testQuotationId}/other-costs/total`,
      config
    );
    console.log(`✅ Total Other Costs: Rs. ${totalResponse.data.total_other_cost}\n`);

    // 7. Get updated quotation details
    console.log('7️⃣ Checking updated quotation totals...');
    const quotationDetails = await axios.get(
      `${BASE_URL}/quotations/${testQuotationId}`,
      config
    );
    console.log('✅ Quotation totals:');
    console.log(`   - Total Parts Cost: Rs. ${quotationDetails.data.total_parts_cost || 0}`);
    console.log(`   - Total Other Cost: Rs. ${quotationDetails.data.total_other_cost || 0}`);
    console.log(`   - Subtotal: Rs. ${quotationDetails.data.subtotal || 0}`);
    console.log(`   - Total Quote Value: Rs. ${quotationDetails.data.total_quote_value || 0}\n`);

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

// Wait a bit for server to start
setTimeout(() => {
  testOtherCosts();
}, 3000);
