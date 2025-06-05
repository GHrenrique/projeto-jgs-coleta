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