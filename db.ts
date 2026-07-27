import { MongoClient, Db, ObjectId } from 'mongodb';
import type { Response } from 'express';

export type SyncPayload = { key: string; data: unknown };

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'mix_atbawi';

const COLLECTIONS = [
  'mix_stores', 'mix_products', 'mix_banners', 'mix_orders',
  'mix_reviews', 'mix_coupons', 'mix_users', 'mix_categories',
  'mix_store_requests', 'mix_payment_methods', 'mix_chat_rooms',
  'mix_activity_logs',
] as const;

const LOCAL_KEY_MAP: Record<string, string> = {
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

type MemoryStore = Record<string, any[]>;

let db: Db | null = null;
let memoryStore: MemoryStore = {};
let usingMemory = false;

const sseClients = new Set<Response>();

export function broadcastSync(key: string, data: unknown) {
  const payload = `data: ${JSON.stringify({ key, data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

export function addSseClient(res: Response) {
  sseClients.add(res);
  return () => sseClients.delete(res);
}

export async function connectDB(): Promise<void> {
  try {
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    await client.connect();
    db = client.db(DB_NAME);
    for (const name of COLLECTIONS) {
      await db.createCollection(name).catch(() => {});
    }
    usingMemory = false;
    console.log(`[DB] MongoDB connected → ${DB_NAME}`);
  } catch (err) {
    usingMemory = true;
    db = null;
    for (const name of COLLECTIONS) {
      if (!memoryStore[name]) memoryStore[name] = [];
    }
    console.warn('[DB] MongoDB unavailable — using in-memory store (data resets on restart)');
    console.warn('[DB]', (err as Error).message);
  }
}

export function isUsingMemory() {
  return usingMemory;
}

async function col(name: string) {
  if (!db) throw new Error('Database not connected');
  return db.collection(name);
}

function memGet(name: string): any[] {
  return memoryStore[name] || [];
}

function memSetAll(name: string, items: any[]) {
  memoryStore[name] = items;
}

export async function getAll(collectionName: string): Promise<any[]> {
  if (usingMemory) return memGet(collectionName);
  const items = await (await col(collectionName)).find({}).toArray();
  return items.map(({ _id, ...rest }) => rest);
}

export async function upsertItem(collectionName: string, item: any): Promise<any> {
  if (!item.id) item.id = new ObjectId().toString();
  item.updatedAt = Date.now();

  if (usingMemory) {
    const list = memGet(collectionName);
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    memSetAll(collectionName, list);
  } else {
    const { _id, ...data } = item;
    await (await col(collectionName)).updateOne(
      { id: item.id },
      { $set: data },
      { upsert: true }
    );
  }

  const localKey = LOCAL_KEY_MAP[collectionName] || collectionName;
  const all = await getAll(collectionName);
  broadcastSync(localKey, all);
  return item;
}

export async function updateItem(collectionName: string, id: string, data: any): Promise<void> {
  if (usingMemory) {
    const list = memGet(collectionName);
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...data };
    memSetAll(collectionName, list);
  } else {
    delete data._id;
    await (await col(collectionName)).updateOne({ id }, { $set: data }, { upsert: true });
  }
  const localKey = LOCAL_KEY_MAP[collectionName] || collectionName;
  broadcastSync(localKey, await getAll(collectionName));
}

export async function deleteItem(collectionName: string, id: string): Promise<void> {
  if (usingMemory) {
    memSetAll(collectionName, memGet(collectionName).filter(x => x.id !== id));
  } else {
    await (await col(collectionName)).deleteOne({ id });
  }
  const localKey = LOCAL_KEY_MAP[collectionName] || collectionName;
  broadcastSync(localKey, await getAll(collectionName));
}

export async function bulkUpsert(collectionName: string, items: any[]): Promise<void> {
  if (usingMemory) {
    const list = [...memGet(collectionName)];
    for (const item of items) {
      if (!item.id) item.id = new ObjectId().toString();
      const idx = list.findIndex(x => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.push(item);
    }
    memSetAll(collectionName, list);
  } else {
    const c = await col(collectionName);
    const ops = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: { ...item, updatedAt: Date.now() } },
        upsert: true,
      },
    }));
    if (ops.length) await c.bulkWrite(ops);
  }
  const localKey = LOCAL_KEY_MAP[collectionName] || collectionName;
  broadcastSync(localKey, await getAll(collectionName));
}

export async function deleteAll(collectionName: string): Promise<void> {
  if (usingMemory) {
    memSetAll(collectionName, []);
  } else {
    await (await col(collectionName)).deleteMany({});
  }
  const localKey = LOCAL_KEY_MAP[collectionName] || collectionName;
  broadcastSync(localKey, []);
}

export async function getSettings(): Promise<any> {
  if (usingMemory) {
    return memoryStore['mix_settings']?.[0] || {};
  }
  return (await col('mix_settings')).findOne({ id: 'platform' }) || {};
}

export async function saveSettings(settings: any): Promise<any> {
  settings.id = 'platform';
  settings.updatedAt = Date.now();
  if (usingMemory) {
    memoryStore['mix_settings'] = [settings];
  } else {
    await (await col('mix_settings')).updateOne(
      { id: 'platform' },
      { $set: settings },
      { upsert: true }
    );
  }
  broadcastSync('mix_platform_settings', settings);
  if (settings.platformName) {
    broadcastSync('mix_platform_name', { value: settings.platformName });
  }
  return settings;
}

export async function getChatMessages(): Promise<Record<string, unknown>> {
  if (usingMemory) {
    return memoryStore['mix_chat_messages']?.[0] || {};
  }
  const doc = await (await col('mix_chat_messages')).findOne({ id: 'all' });
  if (!doc) return {};
  const { _id, id, ...rest } = doc as any;
  return rest;
}

export async function saveChatMessages(roomId: string, messages: unknown[]): Promise<void> {
  const current = await getChatMessages();
  current[roomId] = messages;
  const payload = { id: 'all', ...current, updatedAt: Date.now() };

  if (usingMemory) {
    memoryStore['mix_chat_messages'] = [payload];
  } else {
    await (await col('mix_chat_messages')).updateOne(
      { id: 'all' },
      { $set: payload },
      { upsert: true }
    );
  }
  broadcastSync('mix_chat_messages', current);
}

export async function addLog(log: any): Promise<void> {
  log.timestamp = Date.now();
  if (usingMemory) {
    if (!memoryStore['mix_activity_logs']) memoryStore['mix_activity_logs'] = [];
    memoryStore['mix_activity_logs'].unshift(log);
  } else {
    await (await col('mix_activity_logs')).insertOne(log);
  }
}

export async function bootstrapAll(): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};
  for (const name of COLLECTIONS) {
    const key = LOCAL_KEY_MAP[name] || name;
    result[key] = await getAll(name);
  }
  result['mix_platform_settings'] = await getSettings();
  result['mix_chat_messages'] = await getChatMessages();
  return result;
}

export { LOCAL_KEY_MAP, COLLECTIONS };
