require('dotenv').config();
const authController = require('./controllers/authController');
const User = require('./models/User');

async function testAllLogins() {
  console.log('🔐 Testing All User Login Endpoints\n');
  
  const credentials = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'john.sales', password: 'password123', role: 'sales' },
    { username: 'jane.engineer', password: 'password123', role: 'engineer' },
    { username: 'mike.manager', password: 'password123', role: 'management' },
    { username: 'tech.support', password: 'password123', role: 'technician' }
  ];

  for (const cred of credentials) {
    console.log(`Testing: ${cred.username}`);
    
    // Simulate login request
    const req = {
      body: { username: cred.username, password: cred.password }
    };
    
    let loginSuccess = false;
    let responseData = null;
    
    const res = {
      status: (code) => ({
        json: (data) => {
          if (code === 200 || !code) {
            loginSuccess = true;
            responseData = data;
          } else {
            console.log(`  ❌ Login FAILED - Status: ${code}`);
            console.log(`     Error: ${data.error || data.message}`);
          }
        }
      }),
      json: (data) => {
        loginSuccess = true;
        responseData = data;
      }
    };
    
    await authController.login(req, res);
    
    if (loginSuccess && responseData) {
      console.log(`  ✅ Login SUCCESSFUL`);
      console.log(`     Role: ${responseData.user.role}`);
      console.log(`     Token: ${responseData.token ? 'Generated' : 'Missing'}`);
      console.log(`     Full Name: ${responseData.user.full_name}`);
    }
    console.log('');
  }
  
  console.log('\n✅ All login tests completed!');
  process.exit(0);
}

testAllLogins().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
