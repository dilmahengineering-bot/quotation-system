require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAddMachine() {
  try {
    console.log('🔍 Testing Machine Creation...\n');

    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get current machines
    console.log('Step 2: Getting current machines...');
    const getMachinesRes = await axios.get(`${API_URL}/machines`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${getMachinesRes.data.length} machines\n`);

    // Step 3: Create new machine
    console.log('Step 3: Creating new machine...');
    const newMachine = {
      machine_name: 'Test CNC Router',
      machine_type: 'Routing',
      hourly_rate: 75.50
    };

    const createRes = await axios.post(`${API_URL}/machines`, newMachine, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Machine created successfully!');
    console.log('   ID:', createRes.data.machine_id);
    console.log('   Name:', createRes.data.machine_name);
    console.log('   Type:', createRes.data.machine_type);
    console.log('   Rate: $' + parseFloat(createRes.data.hourly_rate).toFixed(2));
    console.log('   Active:', createRes.data.is_active);

    // Step 4: Verify machine was added
    console.log('\nStep 4: Verifying machine was added...');
    const verifyRes = await axios.get(`${API_URL}/machines`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Now have ${verifyRes.data.length} machines (increased by 1)\n`);

    // Step 5: Get specific machine
    console.log('Step 5: Getting specific machine by ID...');
    const getOneRes = await axios.get(`${API_URL}/machines/${createRes.data.machine_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Retrieved machine:', getOneRes.data.machine_name);

    // Step 6: Update machine
    console.log('\nStep 6: Updating machine...');
    const updateRes = await axios.put(`${API_URL}/machines/${createRes.data.machine_id}`, {
      machine_name: 'Updated CNC Router',
      machine_type: 'Routing',
      hourly_rate: 80.00
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Machine updated!');
    console.log('   New Name:', updateRes.data.machine_name);
    console.log('   New Rate: $' + parseFloat(updateRes.data.hourly_rate).toFixed(2));

    // Step 7: Disable machine
    console.log('\nStep 7: Disabling machine...');
    const disableRes = await axios.patch(`${API_URL}/machines/${createRes.data.machine_id}/disable`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Machine disabled!');
    console.log('   Active:', disableRes.data.is_active);

    console.log('\n✅ ALL TESTS PASSED! Machine CRUD operations working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAddMachine();
