import MongoClient from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.databaseName = process.env.DB_DATABASE || 'files_manager';

    // Initialize MongoClient
    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = null;
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('mydatabase');
      this.connected = true;
      console.log('Connected successfully to MongoDB');
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

const dbClient = new DBClient();
module.exports = dbClient;
