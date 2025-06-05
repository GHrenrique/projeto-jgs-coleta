import { connect } from '../mongo.js';

export default async function handler(req, res) {
  const db = await connect();

  if (req.method === 'GET') {
    let config = await db.collection('config').findOne({ _id: 'main' });
    if (!config) {
      config = { _id: 'main', ultimoProtocolo: 0 };
      await db.collection('config').insertOne(config);
    }
    res.status(200).json(config);
  } else if (req.method === 'PUT') {
    const { ultimoProtocolo } = req.body;
    await db.collection('config').updateOne(
      { _id: 'main' },
      { $set: { ultimoProtocolo } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 