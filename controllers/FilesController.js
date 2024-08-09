const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
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

      let parentPath = FOLDER_PATH;
      if (parentId) {
        const parentFile = await dbsUtil.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }

        parentPath = parentFile.localPath || path.join(FOLDER_PATH, parentFile._id.toString());
      }

      const file = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId ? new ObjectId(parentId) : 0,
        localPath: null,
      };

      if (type === 'folder') {
        file.localPath = path.join(parentPath, name);
        try {
          await fs.mkdir(file.localPath, { recursive: true });
        } catch (error) {
          console.error(error);
        }
        const result = await dbsUtil.db.collection('files').insertOne(file);
        return res.status(201).json({
          id: result.ops[0]._id,
          userId: result.ops[0].userId,
          name: result.ops[0].name,
          type: result.ops[0].type,
          isPublic: result.ops[0].isPublic,
          parentId: result.ops[0].parentId,
        });
      }

      const fileName = `${uuidv4()}`;
      const filePath = path.join(parentPath, fileName);
      const fileData = Buffer.from(data, 'base64');

      try {
        await fs.mkdir(parentPath, { recursive: true });
        await fs.writeFile(filePath, fileData);
      } catch (error) {
        console.error(error);
      }

      // await fs.writeFile(filePath, fileData);
      file.localPath = filePath;

      const result = await dbsUtil.db.collection('files').insertOne(file);
      return res.status(201).json({
        id: result.ops[0]._id,
        userId: result.ops[0].userId,
        name: result.ops[0].name,
        type: result.ops[0].type,
        isPublic: result.ops[0].isPublic,
        parentId: result.ops[0].parentId,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;
