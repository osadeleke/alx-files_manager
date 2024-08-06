import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isConnected = false;
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
    this.connectionPromise = new Promise((resolve) => {
    //   this.client = redis.createClient();
      this.client.on('connect', () => {
        this.isConnected = true;
      });
    });
  }

  async isAlive() {
    // await this.connectionPromise;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // Usage
    await wait(10000);
    return this.isConnected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
