import { connect } from '../../../mongo.js';

export default async function handler(req, res) {
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