require('dotenv').config();
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
  redisClient.connect().catch(console.error);
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully!');
});
redisClient.connect().catch(console.error);
module.exports = redisClient;