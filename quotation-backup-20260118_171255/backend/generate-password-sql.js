const bcrypt = require('bcryptjs');

console.log('='.repeat(60));
console.log('USER PASSWORD HASHES FOR DATABASE');
console.log('='.repeat(60));
console.log('');

// Generate password hashes
const adminPass = 'admin123';
const userPass = 'user123';

bcrypt.hash(adminPass, 10, (err, adminHash) => {
  if (err) {
    console.error('Error hashing admin password:', err);
    return;
  }
  
  bcrypt.hash(userPass, 10, (err, userHash) => {
    if (err) {
      console.error('Error hashing user password:', err);
      return;
    }
    
    console.log('Copy and paste these SQL commands into pgAdmin or psql:');
    console.log('');
    console.log('-'.repeat(60));
    console.log('');
    console.log('-- Delete existing users');
    console.log('DELETE FROM users;');
    console.log('');
    console.log('-- Insert admin user (password: admin123)');
    console.log(`INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('admin', '${adminHash}', 'System Administrator', 'admin@company.com', 'admin');`);
    console.log('');
    console.log('-- Insert regular user (password: user123)');
    console.log(`INSERT INTO users (username, password_hash, full_name, email, role) VALUES ('user', '${userHash}', 'Regular User', 'user@company.com', 'user');`);
    console.log('');
    console.log('-- Verify users');
    console.log('SELECT username, full_name, role, is_active FROM users;');
    console.log('');
    console.log('-'.repeat(60));
    console.log('');
    console.log('LOGIN CREDENTIALS:');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  User:  username=user, password=user123');
    console.log('');
    console.log('='.repeat(60));
  });
});
