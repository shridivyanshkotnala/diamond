const Redis = require('ioredis');
const config = require('../config/env');

const redis = new Redis(config.redis.url);

redis.on('connect', () => {
  console.log('Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redis;
