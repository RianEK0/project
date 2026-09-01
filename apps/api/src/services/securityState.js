import { createHash } from "node:crypto";
import { createClient } from "redis";
import { env } from "../config/env.js";

const localCounters = new Map();
const localBlocks = new Map();
const MAX_LOCAL_ENTRIES = 20000;
let redisClient = null;
let backend = "local";

const INCREMENT_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
`;

const DECREMENT_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current <= 1 then
  redis.call('DEL', KEYS[1])
  return 0
end
return redis.call('DECR', KEYS[1])
`;

function identityDigest(value) {
  return createHash("sha256").update(String(value || "unknown")).digest("hex");
}

function stateKey(scope, identity) {
  const safeScope = String(scope || "general").replace(/[^A-Za-z0-9:_-]/g, "_").slice(0, 80);
  return `${env.securityStateKeyPrefix}:${safeScope}:${identityDigest(identity)}`;
}

function blockIndexKey() {
  return `${env.securityStateKeyPrefix}:blocks:index`;
}

function cleanupLocal(now = Date.now()) {
  for (const [key, entry] of localCounters) {
    if (entry.resetAt <= now) localCounters.delete(key);
  }
  for (const [key, entry] of localBlocks) {
    if (entry.blockedUntil <= now) localBlocks.delete(key);
  }
  while (localCounters.size > MAX_LOCAL_ENTRIES) localCounters.delete(localCounters.keys().next().value);
  while (localBlocks.size > MAX_LOCAL_ENTRIES) localBlocks.delete(localBlocks.keys().next().value);
}

function localIncrement(scope, identity, windowMs) {
  const now = Date.now();
  const key = stateKey(scope, identity);
  const current = localCounters.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;
  entry.count += 1;
  localCounters.set(key, entry);
  if (localCounters.size % 128 === 0 || localCounters.size > MAX_LOCAL_ENTRIES) cleanupLocal(now);
  return { count: entry.count, resetAt: entry.resetAt };
}

async function withRedis(operation, localFallback) {
  if (backend !== "redis" || !redisClient?.isReady) return localFallback();
  try {
    return await operation(redisClient);
  } catch (error) {
    if (env.securityStateRequired) {
      error.code ||= "SECURITY_STATE_UNAVAILABLE";
      throw error;
    }
    console.warn(`Security state Redis tidak tersedia; memakai fallback lokal: ${error.code || error.message}`);
    return localFallback();
  }
}

export async function initializeSecurityState() {
  if (!env.securityStateRedisUrl) {
    if (env.securityStateRequired) throw new Error("Security state Redis wajib tersedia");
    return { backend: "local", ready: true };
  }

  const client = createClient({
    url: env.securityStateRedisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy(retries) {
        return Math.min(100 * (2 ** Math.min(retries, 5)), 3000);
      }
    }
  });
  client.on("error", (error) => {
    console.error(`Security state Redis error: ${error.code || error.message}`);
  });

  try {
    await client.connect();
    await client.ping();
    redisClient = client;
    backend = "redis";
    return { backend, ready: true };
  } catch (error) {
    if (client.isOpen) await client.disconnect().catch(() => undefined);
    if (env.securityStateRequired) throw new Error("Security state Redis gagal diinisialisasi", { cause: error });
    console.warn(`Security state Redis opsional gagal diinisialisasi: ${error.code || error.message}`);
    return { backend: "local", ready: true };
  }
}

export async function closeSecurityState() {
  if (redisClient?.isOpen) await redisClient.quit().catch(() => redisClient.disconnect());
  redisClient = null;
  backend = "local";
}

export function securityStateStatus() {
  return {
    backend,
    ready: backend === "local" ? !env.securityStateRequired : Boolean(redisClient?.isReady),
    distributed: backend === "redis"
  };
}

export async function incrementSecurityCounter(scope, identity, windowMs) {
  const normalizedWindow = Math.max(1000, Number(windowMs) || 1000);
  return withRedis(
    async (client) => {
      const now = Date.now();
      const result = await client.eval(INCREMENT_SCRIPT, {
        keys: [stateKey(`counter:${scope}`, identity)],
        arguments: [String(normalizedWindow)]
      });
      const count = Number(result[0]);
      const ttl = Math.max(Number(result[1]), 1);
      return { count, resetAt: now + ttl };
    },
    () => localIncrement(`counter:${scope}`, identity, normalizedWindow)
  );
}

export async function decrementSecurityCounter(scope, identity) {
  return withRedis(
    (client) => client.eval(DECREMENT_SCRIPT, {
      keys: [stateKey(`counter:${scope}`, identity)],
      arguments: []
    }),
    () => {
      const key = stateKey(`counter:${scope}`, identity);
      const entry = localCounters.get(key);
      if (!entry) return 0;
      entry.count = Math.max(entry.count - 1, 0);
      if (!entry.count) localCounters.delete(key);
      return entry.count;
    }
  );
}

export async function addSecurityStrike(identity, windowMs) {
  return incrementSecurityCounter("strikes", identity, windowMs);
}

export async function setSecurityBlock(identity, entry, durationMs) {
  const now = Date.now();
  const normalizedDuration = Math.max(1000, Number(durationMs) || 1000);
  const blockedUntil = now + normalizedDuration;
  const normalizedEntry = { ...entry, blockedAt: now, blockedUntil };
  const digest = identityDigest(identity);

  await withRedis(
    async (client) => {
      const key = stateKey("block", identity);
      await client.multi()
        .set(key, JSON.stringify(normalizedEntry), { PX: normalizedDuration })
        .zAdd(blockIndexKey(), { score: blockedUntil, value: digest })
        .exec();
    },
    () => {
      localBlocks.set(digest, normalizedEntry);
      cleanupLocal(now);
    }
  );
  return normalizedEntry;
}

export async function getSecurityBlock(identity) {
  const digest = identityDigest(identity);
  return withRedis(
    async (client) => {
      const value = await client.get(stateKey("block", identity));
      if (!value) {
        await client.zRem(blockIndexKey(), digest);
        return null;
      }
      return JSON.parse(value);
    },
    () => {
      cleanupLocal();
      return localBlocks.get(digest) || null;
    }
  );
}

export async function listSecurityBlocks() {
  return withRedis(
    async (client) => {
      const now = Date.now();
      await client.zRemRangeByScore(blockIndexKey(), "-inf", now);
      const digests = await client.zRange(blockIndexKey(), 0, MAX_LOCAL_ENTRIES - 1);
      if (!digests.length) return [];
      const values = await client.mGet(digests.map((digest) => `${env.securityStateKeyPrefix}:block:${digest}`));
      return values.filter(Boolean).map((value) => JSON.parse(value));
    },
    () => {
      cleanupLocal();
      return [...localBlocks.values()];
    }
  );
}
