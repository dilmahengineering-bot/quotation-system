require('dotenv').config();
const User = require('./models/User');
const pool = require('./config/database');

async function testAllUsers() {
  try {
    console.log('🔍 Testing All User Logins...\n');
    
    // Get all users from database
    const result = await pool.query('SELECT username, role, is_active FROM users ORDER BY username');
    
    console.log(`📊 Total users in database: ${result.rows.length}\n`);
    
    const testCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'john.sales', password: 'password123' },
      { username: 'jane.engineer', password: 'password123' },
      { username: 'mike.manager', password: 'password123' }
    ];
    
    console.log('Testing login credentials:\n');
    
    for (const cred of testCredentials) {
      console.log(`Testing: ${cred.username}`);
      
      // Get user
      const user = await User.getByUsername(cred.username);
      
      if (!user) {
        console.log(`  ❌ User NOT FOUND in database\n`);
        continue;
      }
      
      console.log(`  ✅ User found`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Active: ${user.is_active}`);
      console.log(`     Email: ${user.email || 'N/A'}`);
      
      // Test password
      const isValid = await User.verifyPassword(cred.password, user.password_hash);
      
      if (isValid) {
        console.log(`  ✅ Password "${cred.password}" is CORRECT`);
      } else {
        console.log(`  ❌ Password "${cred.password}" is INCORRECT`);
      }
      console.log('');
    }
    
    // List all users in database
    console.log('\n📋 All users in database:');
    result.rows.forEach(u => {
      console.log(`  - ${u.username} (${u.role}) - Active: ${u.is_active}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAllUsers();
