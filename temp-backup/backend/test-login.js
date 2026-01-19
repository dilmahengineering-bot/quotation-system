require('dotenv').config();
const User = require('./models/User');

async function testLogin() {
  try {
    console.log('🔍 Testing Login System...\n');
    
    // Test getting user by username
    console.log('1. Checking for admin user...');
    const user = await User.getByUsername('admin');
    
    if (!user) {
      console.log('❌ User "admin" not found in database');
      console.log('\n📝 Checking all users...');
      const pool = require('./config/database');
      const result = await pool.query('SELECT username, role, is_active FROM users');
      console.log('Total users:', result.rows.length);
      result.rows.forEach(u => {
        console.log(`  - ${u.username} (${u.role}) - Active: ${u.is_active}`);
      });
      return;
    }
    
    console.log('✅ User found:', user.username);
    console.log('   Role:', user.role);
    console.log('   Active:', user.is_active);
    console.log('   Has password hash:', !!user.password_hash);
    
    // Test password verification
    console.log('\n2. Testing password verification...');
    const testPassword = 'admin123';
    const isValid = await User.verifyPassword(testPassword, user.password_hash);
    
    if (isValid) {
      console.log(`✅ Password "${testPassword}" is correct!`);
    } else {
      console.log(`❌ Password "${testPassword}" is incorrect`);
      console.log('   Trying common passwords...');
      
      const passwords = ['password', 'admin', '123456', 'Admin@123'];
      for (const pwd of passwords) {
        const check = await User.verifyPassword(pwd, user.password_hash);
        if (check) {
          console.log(`✅ Correct password found: "${pwd}"`);
          break;
        } else {
          console.log(`   ❌ Not: "${pwd}"`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLogin();
