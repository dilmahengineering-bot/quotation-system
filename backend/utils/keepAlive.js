// Keep Render service alive by pinging itself
const https = require('https');

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

function pingServer() {
  if (!BACKEND_URL) {
    console.log('⏭️  Self-ping disabled (no RENDER_EXTERNAL_URL set)');
    return;
  }

  const url = BACKEND_URL.endsWith('/') ? BACKEND_URL + 'health' : BACKEND_URL + '/health';
  
  console.log('🏓 Pinging self to stay awake:', url);
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Self-ping successful - service staying awake');
    } else {
      console.log('⚠️  Self-ping returned status:', res.statusCode);
    }
  }).on('error', (err) => {
    console.error('❌ Self-ping failed:', err.message);
  });
}

// Start pinging every 14 minutes
function startKeepAlive() {
  if (process.env.NODE_ENV === 'production' && BACKEND_URL) {
    console.log('🎯 Keep-alive service started (pings every 14 minutes)');
    setInterval(pingServer, PING_INTERVAL);
    // Ping once immediately
    setTimeout(pingServer, 30000); // After 30 seconds
  } else {
    console.log('⏭️  Keep-alive disabled (development mode or no URL)');
  }
}

module.exports = { startKeepAlive };
