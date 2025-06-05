const fs = require('fs');
const { connect } = require('./mongo');

async function importData() {
  const db = await connect();
  const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));

  if (data.clientes) {
    await db.collection('clientes').deleteMany({});
    await db.collection('clientes').insertMany(data.clientes);
    console.log('Clientes importados');
  }
  if (data.protocolos) {
    await db.collection('protocolos').deleteMany({});
    await db.collection('protocolos').insertMany(data.protocolos);
    console.log('Protocolos importados');
  }
  if (data.config) {
    await db.collection('config').deleteMany({});
    await db.collection('config').insertOne({ _id: 'main', ...data.config });
    console.log('Config importada');
  }
  process.exit();
}

importData(); 