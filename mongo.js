import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URL - use environment variable or fallback to local MongoDB
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const dbName = 'jgs-coleta';

let client = null;
let db = null;

export async function connect() {
  if (db) return db;
  client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  return db;
}

// Função para fechar a conexão
export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Conexão com MongoDB fechada');
  }
} 