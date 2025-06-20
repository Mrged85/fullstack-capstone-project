require('dotenv').config();
const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const dbName = 'giftdb';
const collectionName = 'gifts';
const jsonFile = 'gifts.json'; // Certifica-te que este ficheiro está na mesma pasta

async function seedData() {
  try {
    const data = fs.readFileSync(jsonFile, 'utf8');
    const gifts = JSON.parse(data);

    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Ligado à base de dados');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertMany(gifts);
    console.log(`🎉 ${result.insertedCount} gifts inseridos com sucesso!`);

    await client.close();
  } catch (err) {
    console.error('❌ Erro ao semear a base de dados:', err.message);
  }
}

seedData();