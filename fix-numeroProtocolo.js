const { connect } = require('./mongo');

async function fixNumeroProtocolo() {
  const db = await connect();
  const protocolos = await db.collection('protocolos').find({}).toArray();
  let count = 0;
  for (const protocolo of protocolos) {
    if (typeof protocolo.numeroProtocolo === 'string') {
      const numero = parseInt(protocolo.numeroProtocolo);
      if (!isNaN(numero)) {
        await db.collection('protocolos').updateOne(
          { _id: protocolo._id },
          { $set: { numeroProtocolo: numero } }
        );
        count++;
      }
    }
  }
  console.log(`Corrigidos ${count} protocolos.`);
  process.exit();
}

fixNumeroProtocolo(); 