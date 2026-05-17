const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.getAttendances);
router.get('/summary', verifyToken, controller.getAttendanceSummary);
router.get('/reminder', verifyToken, controller.getTodayReminder);
router.get('/export', verifyToken, controller.exportAttendances);
router.post('/check-in', verifyToken, controller.checkIn);
router.post('/check-out', verifyToken, controller.checkOut);

module.exports = router;
