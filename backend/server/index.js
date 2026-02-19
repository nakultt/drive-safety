// Minimal Express backend for /api/events with WebSocket broadcasting
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { MongoClient } = require('mongodb');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// In-memory DB with optional MongoDB persistence
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events.json');
fs.ensureDirSync(path.dirname(EVENTS_FILE));
let events = [];
if (fs.existsSync(EVENTS_FILE)) {
  try { events = fs.readJsonSync(EVENTS_FILE); } catch { events = []; }
}

const mongoUri = process.env.MONGO_URI || null;
let mongoClient = null;
let mongoCollection = null;
if (mongoUri) {
  MongoClient.connect(mongoUri).then(client => {
    mongoClient = client;
    mongoCollection = client.db().collection('events');
    console.log('Connected to MongoDB');
  }).catch(err => console.warn('MongoDB unavailable', err.message));
}

function persistEvent(ev) {
  events.unshift(ev);
  if (events.length > 1000) events.pop();
  fs.writeJsonSync(EVENTS_FILE, events, { spaces: 2 });
  if (mongoCollection) {
    mongoCollection.insertOne(ev).catch(() => {});
  }
}

function computeRisk(ev, countSamePlate) {
  // simple heuristic risk score
  let score = Math.min(95, Math.round((ev.speed || 0) * 0.6 + (countSamePlate || 0) * 8 + (ev.violationType === 'Overspeeding' ? 10 : 0)));
  return score;
}

// WebSocket server for real-time events
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/events' });

wss.on('connection', (socket) => {
  console.log('WS client connected');
  socket.send(JSON.stringify({ type: 'hello' }));
});

function broadcastEvent(ev) {
  const msg = JSON.stringify(ev);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// POST /api/events -- accept image + metadata
app.post('/api/events', upload.single('image'), async (req, res) => {
  try {
    const meta = req.body.data ? JSON.parse(req.body.data) : req.body;
    const file = req.file;
    // basic detection: use provided plateNumber or generate one
    let plateNumber = meta.plateNumber || (meta.plate || null);
    if (!plateNumber) {
      // fallback simulated plate
      plateNumber = `SIM${Math.floor(Math.random() * 9000) + 1000}`;
    }

    const sameCount = events.filter(e => e.plateNumber === plateNumber).length;
    const ev = {
      id: uuidv4(),
      plateNumber,
      violationType: meta.violationType || 'Unknown',
      location: meta.location || 'Unknown',
      speed: meta.speed ? Number(meta.speed) : 0,
      severity: meta.severity || (meta.speed && Number(meta.speed) > 80 ? 'High' : 'Medium'),
      fine: meta.fine ? Number(meta.fine) : (meta.speed ? Math.round(meta.speed * 10) : 100),
      isRepeatOffender: sameCount > 0,
      imageUrl: file ? `/uploads/${path.basename(file.path)}` : null,
      plateImageUrl: null,
      riskScore: computeRisk(meta, sameCount),
      timestamp: new Date().toISOString(),
      paid: false,
    };

    persistEvent(ev);
    broadcastEvent(ev);
    return res.status(201).json(ev);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to process event' });
  }
});

// GET endpoints
app.get('/api/events', (req, res) => {
  return res.json(events);
});

app.get('/api/events/summary', (req, res) => {
  const total = events.length;
  const helmet = events.filter(e => e.violationType.toLowerCase().includes('helmet')).length;
  const wrongSide = events.filter(e => e.violationType.toLowerCase().includes('wrong') || e.violationType.toLowerCase().includes('wrong-side')).length;
  const overspeed = events.filter(e => e.violationType.toLowerCase().includes('speed') || e.violationType.toLowerCase().includes('overspeed')).length;
  const repeat = events.filter(e => e.isRepeatOffender).length;
  return res.json({ totalViolations: total, helmetViolations: helmet, wrongSideDriving: wrongSide, overspeeding: overspeed, repeatOffenders: repeat });
});

app.get('/api/events/trend', (req, res) => {
  // simple 7-day trend from timestamps
  const counts = {};
  for (let i=6;i>=0;i--) counts[new Date(Date.now() - i*24*3600*1000).toLocaleDateString()] = 0;
  events.forEach(e => {
    const d = new Date(e.timestamp).toLocaleDateString();
    if (counts[d] !== undefined) counts[d]++;
  });
  const trend = Object.keys(counts).map(k => ({ date: k, count: counts[k] }));
  return res.json(trend);
});

app.get('/api/events/top-offenders', (req, res) => {
  const map = {};
  for (const e of events) {
    map[e.plateNumber] = map[e.plateNumber] || { plate: e.plateNumber, total: 0, fine: 0, last: e.timestamp };
    map[e.plateNumber].total++;
    map[e.plateNumber].fine += e.fine || 0;
    map[e.plateNumber].last = e.timestamp;
  }
  const arr = Object.values(map).sort((a,b)=>b.total-a.total).slice(0,10);
  return res.json(arr);
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
