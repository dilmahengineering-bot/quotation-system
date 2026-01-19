require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function fixPasswords() {
  try {
    console.log('Fixing user passwords...');
    
    // Hash the passwords correctly
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    console.log('Admin password hash:', adminPassword);
    console.log('User password hash:', userPassword);
    
    // Update admin password
    const adminResult = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
      [adminPassword, 'admin']
    );
    
    if (adminResult.rows.length > 0) {
      console.log('✓ Admin password updated successfully');
    } else {
      console.log('✗ Admin user not found, creating...');
      await pool.query(
        `INSERT INTO users (username, password_hash, full_name, email, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin', adminPassword, 'System Administrator', 'admin@company.com', 'admin']
      );
      console.log('✓ Admin user created');
    }
    
    // Update user password
    const userResult = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
      [userPassword, 'user']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✓ User password updated successfully');
    } else {
      console.log('✗ User not found, creating...');
      await pool.query(
        `INSERT INTO users (username, password_hash, full_name, email, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['user', userPassword, 'Regular User', 'user@company.com', 'user']
      );
      console.log('✓ User created');
    }
    
    // Verify users exist
    const allUsers = await pool.query('SELECT username, role, is_active FROM users');
    console.log('\nAll users in database:');
    allUsers.rows.forEach(u => {
      console.log(`  - ${u.username} (${u.role}) - Active: ${u.is_active}`);
    });
    
    console.log('\nLogin credentials:');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  User:  username=user, password=user123');
    
  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    await pool.end();
  }
}

fixPasswords();
