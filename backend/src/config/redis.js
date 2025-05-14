const Redis = require('ioredis');

let redis;

// Check if we're in production and have Redis URL
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Default local connection
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });
}

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redis;