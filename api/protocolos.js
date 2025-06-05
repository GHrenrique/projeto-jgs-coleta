import { connect } from '../mongo.js';

export default async function handler(req, res) {
  const db = await connect();

  if (req.method === 'GET') {
    const protocolos = await db.collection('protocolos').find().toArray();
    res.status(200).json(protocolos);
  } else if (req.method === 'POST') {
    let protocolo = req.body;
    if (!protocolo.numeroProtocolo) {
      const last = await db.collection('protocolos').find().sort({ numeroProtocolo: -1 }).limit(1).toArray();
      protocolo.numeroProtocolo = last.length > 0 ? last[0].numeroProtocolo + 1 : 1;
    } else {
      protocolo.numeroProtocolo = Number(protocolo.numeroProtocolo);
    }
    await db.collection('protocolos').insertOne(protocolo);
    res.status(201).json(protocolo);
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 