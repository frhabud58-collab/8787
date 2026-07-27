require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'mix_atbawi';

let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('[MongoDB] Connected to:', DB_NAME);

    const collections = [
      'mix_stores', 'mix_products', 'mix_banners', 'mix_orders',
      'mix_reviews', 'mix_coupons', 'mix_users', 'mix_categories',
      'mix_store_requests', 'mix_activity_logs'
    ];
    for (const name of collections) {
      await db.createCollection(name).catch(() => {});
    }
    console.log('[MongoDB] Collections ready');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
}

// Generic CRUD helpers
function crudRoutes(collectionName, routePath) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const items = await db.collection(collectionName).find({}).toArray();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const item = await db.collection(collectionName).findOne({ id: req.params.id });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const item = req.body;
      if (!item.id) item.id = new ObjectId().toString();
      item.createdAt = Date.now();
      await db.collection(collectionName).updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const update = req.body;
      delete update._id;
      await db.collection(collectionName).updateOne(
        { id: req.params.id },
        { $set: update },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await db.collection(collectionName).deleteOne({ id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/bulk', async (req, res) => {
    try {
      const items = req.body;
      const ops = items.map(item => ({
        updateOne: {
          filter: { id: item.id },
          update: { $set: item },
          upsert: true
        }
      }));
      if (ops.length > 0) {
        await db.collection(collectionName).bulkWrite(ops);
      }
      res.json({ success: true, count: items.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/', async (req, res) => {
    try {
      await db.collection(collectionName).deleteMany({});
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use(routePath, router);
}

// Settings routes (single document)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.collection('mix_settings').findOne({ id: 'platform' });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    settings.id = 'platform';
    settings.updatedAt = Date.now();
    await db.collection('mix_settings').updateOne(
      { id: 'platform' },
      { $set: settings },
      { upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activity logs
app.post('/api/logs', async (req, res) => {
  try {
    const log = req.body;
    log.timestamp = Date.now();
    await db.collection('mix_activity_logs').insertOne(log);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.collection('mix_activity_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup all CRUD routes
crudRoutes('mix_stores', '/api/stores');
crudRoutes('mix_products', '/api/products');
crudRoutes('mix_banners', '/api/banners');
crudRoutes('mix_orders', '/api/orders');
crudRoutes('mix_reviews', '/api/reviews');
crudRoutes('mix_coupons', '/api/coupons');
crudRoutes('mix_users', '/api/users');
crudRoutes('mix_categories', '/api/categories');
crudRoutes('mix_store_requests', '/api/store-requests');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: DB_NAME, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
});
