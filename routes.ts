import { Router, type Express, type Response } from 'express';
import {
  getAll, upsertItem, updateItem, deleteItem, bulkUpsert, deleteAll,
  getSettings, saveSettings, getChatMessages, saveChatMessages, addLog,
  addSseClient, bootstrapAll, isUsingMemory, broadcastSync,
} from './db';

function crudRoutes(collectionName: string, routePath: string) {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      res.json(await getAll(collectionName));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      res.json(await upsertItem(collectionName, req.body));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      await updateItem(collectionName, req.params.id, req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await deleteItem(collectionName, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/bulk', async (req, res) => {
    try {
      await bulkUpsert(collectionName, req.body);
      res.json({ success: true, count: req.body.length });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.delete('/', async (_req, res) => {
    try {
      await deleteAll(collectionName);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return { path: routePath, router };
}

export function setupApiRoutes(app: Express) {
  const routes = [
    crudRoutes('mix_stores', '/api/stores'),
    crudRoutes('mix_products', '/api/products'),
    crudRoutes('mix_banners', '/api/banners'),
    crudRoutes('mix_orders', '/api/orders'),
    crudRoutes('mix_reviews', '/api/reviews'),
    crudRoutes('mix_coupons', '/api/coupons'),
    crudRoutes('mix_users', '/api/users'),
    crudRoutes('mix_categories', '/api/categories'),
    crudRoutes('mix_store_requests', '/api/store-requests'),
    crudRoutes('mix_payment_methods', '/api/payment-methods'),
    crudRoutes('mix_chat_rooms', '/api/chat-rooms'),
  ];

  for (const { path, router } of routes) {
    app.use(path, router);
  }

  app.get('/api/settings', async (_req, res) => {
    try {
      res.json(await getSettings());
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      res.json(await saveSettings(req.body));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/chat-messages', async (_req, res) => {
    try {
      res.json(await getChatMessages());
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.put('/api/chat-messages/:roomId', async (req, res) => {
    try {
      await saveChatMessages(req.params.roomId, req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/logs', async (req, res) => {
    try {
      await addLog(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: isUsingMemory() ? 'memory' : 'mongodb',
      time: new Date().toISOString(),
    });
  });

  app.get('/api/bootstrap', async (_req, res) => {
    try {
      res.json(await bootstrapAll());
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // SSE — real-time push to ALL connected browsers/devices
  app.get('/api/sync/stream', (req, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ key: '_connected', data: { ok: true } })}\n\n`);
    const remove = addSseClient(res);

    req.on('close', () => remove());
  });

  // Push local data to server on first connect (if server is empty)
  app.post('/api/bootstrap/upload', async (req, res) => {
    try {
      const payload = req.body as Record<string, unknown>;
      for (const [key, data] of Object.entries(payload)) {
        if (key === 'mix_platform_settings' && data && typeof data === 'object') {
          const existing = await getSettings();
          if (!existing || !existing.id) await saveSettings(data as any);
          continue;
        }
        if (key === 'mix_chat_messages' && data && typeof data === 'object') {
          const existing = await getChatMessages();
          if (Object.keys(existing).length === 0) {
            for (const [roomId, msgs] of Object.entries(data as Record<string, unknown>)) {
              await saveChatMessages(roomId, msgs as unknown[]);
            }
          }
          continue;
        }
        const colMap: Record<string, string> = {
          mix_stores: 'mix_stores',
          mix_products: 'mix_products',
          mix_banners: 'mix_banners',
          mix_orders: 'mix_orders',
          mix_reviews: 'mix_reviews',
          mix_coupons: 'mix_coupons',
          mix_users: 'mix_users',
          mix_categories: 'mix_categories',
          mix_store_requests: 'mix_store_requests',
          mix_payment_methods: 'mix_payment_methods',
          mix_chat_rooms: 'mix_chat_rooms',
        };
        const col = colMap[key];
        if (!col || !Array.isArray(data)) continue;
        const existing = await getAll(col);
        if (existing.length === 0 && data.length > 0) {
          await bulkUpsert(col, data);
        }
      }
      broadcastSync('_synced', { ok: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
}
