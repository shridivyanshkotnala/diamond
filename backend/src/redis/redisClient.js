const Redis = require('ioredis');
const config = require('../config/env');

let redis = null;

if (process.env.USE_MEMORY_STORE !== 'true') {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  });

  redis.on('connect', () => {
    console.log('[redis] Connected to Redis');
  });

  redis.on('ready', () => {
    console.log('[redis] Redis client ready');
  });

  redis.on('error', (err) => {
    console.error('[redis] Error:', err.message);
  });

  redis.on('reconnecting', () => {
    console.log('[redis] Reconnecting to Redis...');
  });

  redis.on('close', () => {
    console.log('[redis] Redis connection closed');
  });
} else {
  console.log('[redis] USE_MEMORY_STORE=true — skipping Redis connection');
}

module.exports = redis;
