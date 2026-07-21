const os = require('os');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { initMcxScheduler } = require('./services/mcxScheduler.service');
const DiamondRate = require('./models/diamondRate.model');

const PORT = config.port || 3000;
const HOST = '0.0.0.0';

function getLanAddresses() {
  const addresses = new Set(['127.0.0.1', 'localhost']);
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.add(entry.address);
      }
    }
  }

  return [...addresses];
}

connectDB().then(async () => {
  try {
    await DiamondRate.syncIndexes();
    console.log('[DB] DiamondRate indexes synced');
  } catch (error) {
    console.warn('[DB] Failed to sync DiamondRate indexes:', error.message);
  }

  // Initialize the background polling scheduler for MCX rates
  await initMcxScheduler();

  app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} in ${config.env} mode`);
    console.log('API URLs for Expo / phone testing:');
    for (const address of getLanAddresses()) {
      console.log(`  http://${address}:${PORT}/api/v1/health`);
    }
    if (config.env === 'development') {
      console.log('Dev OTPs print here after contact-details submit.');
    }
  });
});
