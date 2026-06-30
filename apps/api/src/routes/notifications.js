import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";
import { checkAndGenerateNotifications } from "../services/notificationService.js";
import { addConnection, removeConnection } from "../services/sseManager.js";

const router = Router();

// GET /api/notifications/stream — SSE real-time
router.get(
  "/stream",
  authenticate,
  (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    // Kirim heartbeat setiap 25 detik agar koneksi tidak di-drop
    const heartbeat = setInterval(() => {
      res.write(":\n\n");
    }, 25000);

    addConnection(req.user.id, res);

    req.on("close", () => {
      clearInterval(heartbeat);
      removeConnection(req.user.id, res);
    });
  }
);

// GET /api/notifications
router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    // Generate fresh notifications first
    await checkAndGenerateNotifications();

    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  })
);

// PUT /api/notifications/:id/read
router.put(
  "/:id/read",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }

    res.json({ data: result.rows[0] });
  })
);

// PUT /api/notifications/read-all
router.put(
  "/read-all",
  authenticate,
  asyncHandler(async (req, res) => {
    await query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ message: "Semua notifikasi ditandai telah dibaca" });
  })
);

export default router;
