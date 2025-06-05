const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection URL - use environment variable or fallback to local MongoDB
const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'jgs-coleta';

let client = null;
let db = null;

async function connect() {
  try {
    if (db) return db;
    
    client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
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