const sha1 = require('sha1');
const dbsUtil = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await dbsUtil.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }
      const hashedPassword = sha1(password);
      const newUser = {
        email,
        password: hashedPassword,
      };
      const result = await dbsUtil.db.collection('users').insertOne(newUser);

      return res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
