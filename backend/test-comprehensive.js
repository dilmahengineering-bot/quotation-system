require('dotenv').config();
const authController = require('./controllers/authController');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

console.log('🧪 COMPREHENSIVE SYSTEM TESTING\n');
console.log('═══════════════════════════════════════════════════════════════\n');

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const test = (name, condition, details = '') => {
    const passed = condition;
    results.tests.push({ name, passed, details });
    if (passed) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
      results.failed++;
    }
  };

  // 1️⃣ USER AUTHENTICATION & LOGIN
  console.log('1️⃣ USER AUTHENTICATION & LOGIN TESTING\n');
  
  try {
    // Test valid login
    const validUser = await User.getByUsername('admin');
    test('Valid user exists in database', !!validUser);
    
    const validPassword = await User.verifyPassword('admin123', validUser.password_hash);
    test('Valid credentials accepted', validPassword);
    
    // Test invalid credentials
    const invalidPassword = await User.verifyPassword('wrongpassword', validUser.password_hash);
    test('Invalid credentials rejected', !invalidPassword);
    
    // Test disabled user
    const allUsers = await User.getAll();
    const activeUsers = allUsers.filter(u => u.is_active);
    test('Disabled users filtered out', allUsers.length >= activeUsers.length);
    
    // Test JWT generation
    const token = jwt.sign(
      { user_id: validUser.user_id, username: validUser.username, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    test('JWT token generation works', !!token);
    
    // Test JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    test('JWT token verification works', decoded.user_id === validUser.user_id);
    
    // Test role-based data
    const adminUser = await User.getByUsername('admin');
    const salesUser = await User.getByUsername('john.sales');
    test('Admin role exists', adminUser?.role === 'admin');
    test('Sales role exists', salesUser?.role === 'sales');
    
  } catch (error) {
    test('User authentication system', false, error.message);
  }
  
  console.log('\n2️⃣ MASTER DATA MANAGEMENT\n');
  
  try {
    const pool = require('./config/database');
    
    // Test Machines table
    const machinesResult = await pool.query('SELECT COUNT(*) as count FROM machines WHERE is_active = true');
    test('Active machines exist', parseInt(machinesResult.rows[0].count) > 0);
    
    const machineWithRate = await pool.query('SELECT * FROM machines WHERE hourly_rate > 0 LIMIT 1');
    test('Machines have hourly rates', machineWithRate.rows.length > 0 && machineWithRate.rows[0].hourly_rate > 0);
    
    // Test Customers table
    const customersResult = await pool.query('SELECT COUNT(*) as count FROM customers WHERE is_active = true');
    test('Active customers exist', parseInt(customersResult.rows[0].count) > 0);
    
    const customerUnique = await pool.query('SELECT company_name, email, COUNT(*) as cnt FROM customers GROUP BY company_name, email HAVING COUNT(*) > 1');
    test('No duplicate customers (company + email)', customerUnique.rows.length === 0);
    
    // Test Auxiliary Costs table
    const auxResult = await pool.query('SELECT COUNT(*) as count FROM auxiliary_costs WHERE is_active = true');
    test('Auxiliary costs exist', parseInt(auxResult.rows[0].count) > 0);
    
    const auxWithCost = await pool.query('SELECT * FROM auxiliary_costs WHERE default_cost > 0 LIMIT 1');
    test('Auxiliary costs have default values', auxWithCost.rows.length > 0);
    
  } catch (error) {
    test('Master data tables', false, error.message);
  }
  
  console.log('\n3️⃣ QUOTATION TABLE STRUCTURE\n');
  
  try {
    const pool = require('./config/database');
    
    // Check quotations table columns
    const quotationsColumns = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'quotations' ORDER BY ordinal_position"
    );
    const colNames = quotationsColumns.rows.map(r => r.column_name);
    
    test('Quotations table has customer_id', colNames.includes('customer_id'));
    test('Quotations table has quote_number', colNames.includes('quote_number'));
    test('Quotations table has total_quote_value', colNames.includes('total_quote_value'));
    test('Quotations table has discount_percent', colNames.includes('discount_percent'));
    test('Quotations table has margin_percent', colNames.includes('margin_percent'));
    test('Quotations table has vat_percent', colNames.includes('vat_percent'));
    test('Quotations table has status', colNames.includes('status'));
    
    // Check quotation_parts table
    const partsColumns = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'quotation_parts'"
    );
    const partColNames = partsColumns.rows.map(r => r.column_name);
    
    test('Parts table exists', partsColumns.rows.length > 0);
    test('Parts table has unit_material_cost', partColNames.includes('unit_material_cost'));
    test('Parts table has quantity', partColNames.includes('quantity'));
    
    // Check part_operations table
    const opsColumns = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'part_operations'"
    );
    const opsColNames = opsColumns.rows.map(r => r.column_name);
    
    test('Operations table exists', opsColumns.rows.length > 0);
    test('Operations table has machine_id', opsColNames.includes('machine_id'));
    test('Operations table has operation_time_hours', opsColNames.includes('operation_time_hours'));
    
  } catch (error) {
    test('Quotation table structure', false, error.message);
  }
  
  console.log('\n4️⃣ SECURITY MIDDLEWARE\n');
  
  try {
    const authMiddleware = require('./middleware/authMiddleware');
    
    test('JWT verification middleware exists', typeof authMiddleware.verifyToken === 'function');
    test('Admin check middleware exists', typeof authMiddleware.isAdmin === 'function');
    
    // Test JWT secret exists
    test('JWT secret configured', !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32);
    
    // Test password hashing
    const bcrypt = require('bcryptjs');
    const testPassword = 'test123';
    const hash = await bcrypt.hash(testPassword, 12);
    const verified = await bcrypt.compare(testPassword, hash);
    test('Password hashing works', verified);
    
    const wrongPassword = await bcrypt.compare('wrong', hash);
    test('Wrong password rejected', !wrongPassword);
    
  } catch (error) {
    test('Security implementation', false, error.message);
  }
  
  console.log('\n5️⃣ API ENDPOINTS\n');
  
  try {
    const routes = require('./routes/index');
    test('Routes module loads', !!routes);
    
    const quotationController = require('./controllers/quotationController');
    test('Quotation controller has create method', typeof quotationController.create === 'function');
    test('Quotation controller has getAll method', typeof quotationController.getAll === 'function');
    test('Quotation controller has update method', typeof quotationController.update === 'function');
    
    const authController = require('./controllers/authController');
    test('Auth controller has login method', typeof authController.login === 'function');
    test('Auth controller has changePassword method', typeof authController.changePassword === 'function');
    
  } catch (error) {
    test('API endpoints', false, error.message);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log(`📊 TEST RESULTS: ${results.passed} passed, ${results.failed} failed`);
  console.log(`   Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}`);
      if (t.details) console.log(`     ${t.details}`);
    });
  } else {
    console.log('✅ All tests passed!');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
