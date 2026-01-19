const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'quotation_db',
  password: 'Dilmah@456',
  port: 5432
});

async function updatePasswords() {
  try {
    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    // Update admin password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [adminHash, 'admin']
    );
    console.log('✓ Admin password updated');

    // Update user password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [userHash, 'user']
    );
    console.log('✓ User password updated');

    console.log('\nPasswords updated successfully!');
    console.log('Admin: admin / admin123');
    console.log('User: user / user123');

    pool.end();
  } catch (error) {
    console.error('Error updating passwords:', error);
    pool.end();
  }
}

updatePasswords();
