const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const dbsUtil = require('../utils/db');
const redisClient = require('../utils/redis');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;
      const userId = await redisClient.get(redisKey);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbsUtil.db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name, type, parentId, isPublic = false, data,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId) {
        const parentFile = await dbsUtil.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const file = {
        userId,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
        localPath: null,
      };

      if (type === 'folder') {
        const result = await dbsUtil.db.collection('files').insertOne(file);
        return res.status(201).json(result.ops[0]);
      }

      const fileName = `${Date.now()}-${uuidv4()}`;
      const filePath = path.join(FOLDER_PATH, fileName);
      const fileData = Buffer.from(data, 'base64');

      fs.writeFileSync(filePath, fileData);
      file.localPath = filePath;

      const result = await dbsUtil.db.collection('files').insertOne(file);
      return res.status(201).json(result.ops[0]);
    } catch (error) {
      console.log(error);
      return res.status(501).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;
