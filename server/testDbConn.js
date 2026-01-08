const pool = require('./config/database');

(async () => {
  try {
    const res = await pool.query('SELECT NOW() AS now');
    console.log('DB connection successful — server time:', res.rows[0].now);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
    process.exit(1);
  }
})();
