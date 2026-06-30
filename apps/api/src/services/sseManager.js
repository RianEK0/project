/**
 * sseManager.js — Mengelola koneksi Server-Sent Events aktif.
 * Semua user yang sedang login akan menerima notifikasi secara real-time.
 */

// Map: userId (number) → Set<Response>
const connections = new Map();

/**
 * Daftarkan koneksi SSE untuk user tertentu.
 * @param {number} userId
 * @param {import('express').Response} res
 */
export function addConnection(userId, res) {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(res);
}

/**
 * Hapus koneksi SSE (saat client disconnect).
 * @param {number} userId
 * @param {import('express').Response} res
 */
export function removeConnection(userId, res) {
  const set = connections.get(userId);
  if (set) {
    set.delete(res);
    if (set.size === 0) connections.delete(userId);
  }
}

/**
 * Kirim notifikasi ke user tertentu via SSE.
 * @param {number} userId
 * @param {object} notification
 */
export function pushToUser(userId, notification) {
  const set = connections.get(userId);
  if (!set || set.size === 0) return;

  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {
      set.delete(res);
    }
  }
}

/**
 * Broadcast notifikasi ke semua user yang sedang online.
 * @param {object} notification
 */
export function broadcastToAll(notification) {
  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const [, set] of connections) {
    for (const res of set) {
      try {
        res.write(data);
      } catch {
        set.delete(res);
      }
    }
  }
}
