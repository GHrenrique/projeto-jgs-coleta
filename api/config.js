import { connect } from '../mongo.js';

export default async function handler(req, res) {
  // CORS headers para todas as requisições
  res.setHeader('Access-Control-Allow-Origin', '*'); // ou coloque o domínio do seu front-end
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 