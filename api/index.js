import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connect } from '../mongo.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Clientes
app.get('/api/clientes', async (req, res) => {
  const db = await connect();
  const clientes = await db.collection('clientes').find().toArray();
  res.json(clientes);
});

app.get('/api/clientes/:id', async (req, res) => {
  const db = await connect();
  const id = parseInt(req.params.id);
  const cliente = await db.collection('clientes').findOne({ id });
  if (cliente) res.json(cliente);
  else res.status(404).json({ error: 'Cliente não encontrado' });
});

app.post('/api/clientes', async (req, res) => {
  const db = await connect();
  const { nome } = req.body;
  const last = await db.collection('clientes').find().sort({ id: -1 }).limit(1).toArray();
  const nextId = last.length > 0 ? last[0].id + 1 : 1;
  const novoCliente = { id: nextId, nome };
  await db.collection('clientes').insertOne(novoCliente);
  res.status(201).json(novoCliente);
});

app.put('/api/clientes/:id', async (req, res) => {
  const db = await connect();
  const id = parseInt(req.params.id);
  const update = req.body;
  await db.collection('clientes').updateOne({ id }, { $set: update });
  res.json({ success: true });
});

app.delete('/api/clientes/:id', async (req, res) => {
  const db = await connect();
  const id = parseInt(req.params.id);
  await db.collection('clientes').deleteOne({ id });
  res.json({ success: true });
});

// Protocolos
app.get('/api/protocolos', async (req, res) => {
  const db = await connect();
  const protocolos = await db.collection('protocolos').find().toArray();
  res.json(protocolos);
});

app.get('/api/protocolos/:id', async (req, res) => {
  const db = await connect();
  const id = parseInt(req.params.id);
  const protocolo = await db.collection('protocolos').findOne({ numeroProtocolo: id });
  if (protocolo) res.json(protocolo);
  else res.status(404).json({ error: 'Protocolo não encontrado' });
});

app.post('/api/protocolos', async (req, res) => {
  const db = await connect();
  let protocolo = req.body;
  if (!protocolo.numeroProtocolo) {
    const last = await db.collection('protocolos').find().sort({ numeroProtocolo: -1 }).limit(1).toArray();
    protocolo.numeroProtocolo = last.length > 0 ? last[0].numeroProtocolo + 1 : 1;
  } else {
    protocolo.numeroProtocolo = Number(protocolo.numeroProtocolo);
  }
  await db.collection('protocolos').insertOne(protocolo);
  res.status(201).json(protocolo);
});

// Config
app.get('/api/config', async (req, res) => {
  try {
    const db = await connect();
    let config = await db.collection('config').findOne({ _id: 'main' });
    if (!config) {
      config = { _id: 'main', ultimoProtocolo: 0 };
      await db.collection('config').insertOne(config);
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const db = await connect();
    const { ultimoProtocolo } = req.body;
    await db.collection('config').updateOne(
      { _id: 'main' },
      { $set: { ultimoProtocolo } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app; 