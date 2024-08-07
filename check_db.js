const { MongoClient } = require('mongodb');

async function listDatabases() {
  const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const databases = await client.db().admin().listDatabases();
    console.log('Databases:');
    databases.databases.forEach((db) => console.log(` - ${db.name}`));
  } finally {
    await client.close();
  }
}

listDatabases().catch(console.error);
