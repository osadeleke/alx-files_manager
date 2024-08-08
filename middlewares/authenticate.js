const redisClient = require('../utils/redis');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['X-Token'];
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.userId = userId;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(501).json({ error: 'Internal server error' });
  }
};

module.exports = authenticate;
