import { connect } from '../../../mongo.js';

export default async function handler(req, res) {
  const db = await connect();
  const id = parseInt(req.query.id);

  if (req.method === 'GET') {
    const cliente = await db.collection('clientes').findOne({ id });
    if (cliente) res.status(200).json(cliente);
    else res.status(404).json({ error: 'Cliente não encontrado' });
  } else if (req.method === 'PUT') {
    const update = req.body;
    await db.collection('clientes').updateOne({ id }, { $set: update });
    res.status(200).json({ success: true });
  } else if (req.method === 'DELETE') {
    await db.collection('clientes').deleteOne({ id });
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 