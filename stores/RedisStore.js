const Redis = require("ioredis");

class RedisStore {
  constructor(redisUrl) {
    this.data = new Redis(process.env.REDIS_URL || redisUrl)
  }

  async get(key) {
    return await this.data.get(key);
  }

  async set(key, state) {
    return await this.data.set(key, JSON.stringify(state));
  }
}

module.exports = RedisStore;