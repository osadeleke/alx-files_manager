const redisUtil = require('../utils/redis');
const dbsUtil = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redStatus = redisUtil.isAlive();
      const dbStatus = dbsUtil.isAlive();
      res.status(200).json({
        redis: redStatus,
        db: dbStatus,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req, res) {
    try {
      const userCount = await dbsUtil.nbUsers();
      const filesCount = await dbsUtil.nbFiles();
      res.status(200).json({
        users: userCount,
        files: filesCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AppController;
