require('dotenv').config();
const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  console.log('\n🔧 Fixing user passwords in Render database...\n');

  const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'john.sales', password: 'sales123' },
    { username: 'jane.engineer', password: 'engineer123' },
    { username: 'user', password: 'user123' }
  ];

  try {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             password_changed_at = CURRENT_TIMESTAMP 
         WHERE username = $2 
         RETURNING username, email, role`,
        [hashedPassword, user.username]
      );

      if (result.rows.length > 0) {
        console.log(`✓ Updated password for: ${result.rows[0].username} (${result.rows[0].role})`);
        console.log(`  Email: ${result.rows[0].email}`);
        console.log(`  New password: ${user.password}\n`);
      } else {
        console.log(`⚠ User not found: ${user.username}\n`);
      }
    }

    console.log('✅ Password update completed!\n');
    console.log('Login Credentials:');
    console.log('  admin / admin123');
    console.log('  john.sales / sales123');
    console.log('  jane.engineer / engineer123');
    console.log('  user / user123\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPasswords();
