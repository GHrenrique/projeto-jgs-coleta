import { MongoClient } from 'mongodb';
require('dotenv').config();

// MongoDB connection URL - use environment variable or fallback to local MongoDB
const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'jgs-coleta';

let client = null;
let db = null;

export async function connect() {
  if (db) return db;
  client = new MongoClient(url, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);
  return db;
}

// Função para fechar a conexão
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Conexão com MongoDB fechada');
  }
}

module.exports = { connect, closeConnection }; 