const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.listNotifications);
router.put('/:id/read', verifyToken, controller.markNotificationRead);

module.exports = router;
