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
    const clientes = await db.collection('clientes').find().toArray();
    res.status(200).json(clientes);
  } else if (req.method === 'POST') {
    const { nome } = req.body;
    const last = await db.collection('clientes').find().sort({ id: -1 }).limit(1).toArray();
    const nextId = last.length > 0 ? last[0].id + 1 : 1;
    const novoCliente = { id: nextId, nome };
    await db.collection('clientes').insertOne(novoCliente);
    res.status(201).json(novoCliente);
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
} 