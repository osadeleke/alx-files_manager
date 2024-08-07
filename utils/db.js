const { MongoClient } = require('mongodb');

// const uri = 'mongodb://localhost:27017';
// let client = new MongoClient(uri, { useUnifiedTopology: true });

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.databaseName = process.env.DB_DATABASE || 'files_manager';
    this.db = null;
    this.connected = false;
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.connected = true;
    } catch (e) {
      console.error('Error connecting to MongoDB', e);
    }
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

module.exports = new DBClient();
