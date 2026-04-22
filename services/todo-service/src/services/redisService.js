import { createClient } from "redis";

let redisClient = null;
const INDEX = "idx:todos";

export async function connectRedis(url) {
  redisClient = createClient({ url });
  redisClient.on("error", (err) => console.error("Redis error:", err));
  await redisClient.connect();
  console.log("Redis connected");
  await ensureSearchIndex();
  return redisClient;
}

// Create RediSearch index for full-text todo search (premium feature)
async function ensureSearchIndex() {
  try {
    await redisClient.sendCommand([
      "FT.CREATE",
      INDEX,
      "ON", "HASH",
      "PREFIX", "1", "todo:",
      "SCHEMA",
      "userId", "TAG",
      "title", "TEXT", "SORTABLE",
      "priority", "TAG",
      "createdAt", "NUMERIC", "SORTABLE"
    ]);
    console.log("RediSearch index created:", INDEX);
  } catch (e) {
    const msg = String(e?.message || e);
    if (!msg.includes("Index already exists")) throw e;
    // Index already exists — nothing to do
  }
}

// Cache helpers
export async function getCache(key) {
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
}

export async function setCache(key, ttlSeconds, data) {
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
}

export async function delCache(key) {
  await redisClient.del(key);
}

// RediSearch HASH index helpers
export async function setTodoHash(id, { userId, title, priority, createdAt }) {
  await redisClient.hSet(`todo:${id}`, {
    userId,
    title,
    priority: priority || "medium",
    createdAt: String(new Date(createdAt).getTime())
  });
}

export async function delTodoHash(id) {
  await redisClient.del(`todo:${id}`);
}

// FT.SEARCH — premium-only full-text search
export async function searchTodos(userId, query) {
  // Escape special characters to avoid FT query injection
  const safeQ = query.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const ftQuery = `@userId:{${userId.replace(/-/g, "\\-")}} @title:(${safeQ})`;

  const result = await redisClient.sendCommand([
    "FT.SEARCH", INDEX, ftQuery,
    "LIMIT", "0", "20",
    "SORTBY", "createdAt", "DESC"
  ]);

  const total = Number(result?.[0] ?? 0);
  const items = [];
  for (let i = 1; i < (result?.length ?? 0); i += 2) {
    const fields = result[i + 1] || [];
    const obj = {};
    for (let j = 0; j < fields.length; j += 2) obj[fields[j]] = fields[j + 1];
    const key = String(result[i]);
    const id = key.replace("todo:", "");
    items.push({ id, title: obj.title, priority: obj.priority });
  }
  return { total, items };
}
