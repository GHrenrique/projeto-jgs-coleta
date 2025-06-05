import { connect } from '../../mongo.js';

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
  const id = parseInt(req.query.id);

  if (req.method === 'GET') {
    const protocolo = await db.collection('protocolos').findOne({ numeroProtocolo: id });
    if (protocolo) res.status(200).json(protocolo);
    else res.status(404).json({ error: 'Protocolo não encontrado' });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 